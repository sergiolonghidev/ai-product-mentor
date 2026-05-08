# Linear Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export a generated User Story to Linear.app as a formatted issue, applying a "compliance" label automatically when the story contains compliance acceptance criteria.

**Architecture:** New `src/lib/linear/` module (client singleton + formatter) keeps all Linear logic isolated. A new API route `POST /api/story/export` orchestrates the export and persists the result. `StoryBlock` gains an export button that transitions to a badge with the Linear issue identifier.

**Tech Stack:** `@linear/sdk` (official TypeScript SDK), Next.js App Router API route, Supabase for persistence, Zod for input validation.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/lib/linear/client.ts` | Singleton `LinearClient`, reads `LINEAR_API_KEY` |
| Create | `src/lib/linear/formatter.ts` | Builds issue title + Markdown description from `UserStory` |
| Create | `src/app/api/story/export/route.ts` | `POST /api/story/export` handler |
| Modify | `src/lib/validators/schemas.ts` | Add `ExportStorySchema` |
| Modify | `src/components/story/StoryBlock.tsx` | Add `storyId?`/`sessionId?` props, export button, badge |
| Modify | `src/components/chat/MessageBubble.tsx` | Pass `storyId` and `sessionId` to `StoryBlock` |

---

## Task 1: Install `@linear/sdk`

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install the SDK**

```bash
cd /home/sergio/ai-product-mentor
npm install @linear/sdk
```

Expected output: `added 1 package` (or similar), no errors.

- [ ] **Step 2: Verify types are available**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: no new errors related to `@linear/sdk`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @linear/sdk"
```

---

## Task 2: Linear client singleton

**Files:**
- Create: `src/lib/linear/client.ts`

- [ ] **Step 1: Create the client**

```typescript
// src/lib/linear/client.ts
import { LinearClient } from '@linear/sdk'

let _linear: LinearClient | null = null

export function getLinearClient(): LinearClient {
  if (!_linear) {
    const key = process.env.LINEAR_API_KEY
    if (!key) throw new Error('LINEAR_API_KEY is not set')
    _linear = new LinearClient({ apiKey: key })
  }
  return _linear
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/sergio/ai-product-mentor && npx tsc --noEmit 2>&1 | grep linear
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/lib/linear/client.ts
git commit -m "feat: add Linear client singleton"
```

---

## Task 3: Issue formatter

**Files:**
- Create: `src/lib/linear/formatter.ts`

- [ ] **Step 1: Create the formatter**

```typescript
// src/lib/linear/formatter.ts
import { UserStory } from '@/types'

const categoryLabels: Record<string, string> = {
  functional: 'Funcional',
  compliance: 'Compliance',
  ux: 'UX',
  performance: 'Performance',
}

type FormattedIssue = {
  title: string
  description: string
  needsComplianceLabel: boolean
}

export function formatStoryAsIssue(
  story: Pick<UserStory, 'persona' | 'action' | 'benefit' | 'acceptanceCriteria'>
): FormattedIssue {
  const title = `Como ${story.persona}, quero ${story.action}`

  const acLines = story.acceptanceCriteria
    .map((ac) => `- **[${categoryLabels[ac.category] ?? ac.category}]** ${ac.description}`)
    .join('\n')

  const description = [
    '## User Story',
    `**Como** ${story.persona}, **quero** ${story.action}, **para** ${story.benefit}.`,
    '',
    '## Critérios de Aceite',
    acLines,
  ].join('\n')

  const needsComplianceLabel = story.acceptanceCriteria.some(
    (ac) => ac.category === 'compliance'
  )

  return { title, description, needsComplianceLabel }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/sergio/ai-product-mentor && npx tsc --noEmit 2>&1 | grep formatter
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/linear/formatter.ts
git commit -m "feat: add Linear issue formatter"
```

---

## Task 4: Add `ExportStorySchema` to validators

**Files:**
- Modify: `src/lib/validators/schemas.ts`

- [ ] **Step 1: Add schema**

Open `src/lib/validators/schemas.ts` and add after the existing `LintStorySchema`:

```typescript
export const ExportStorySchema = z.object({
  storyId: z.string().uuid(),
  sessionId: z.string().uuid(),
})
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/sergio/ai-product-mentor && npx tsc --noEmit 2>&1 | grep schemas
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validators/schemas.ts
git commit -m "feat: add ExportStorySchema validator"
```

---

## Task 5: `POST /api/story/export` route

**Files:**
- Create: `src/app/api/story/export/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/story/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ExportStorySchema } from '@/lib/validators/schemas'
import { getLinearClient } from '@/lib/linear/client'
import { formatStoryAsIssue } from '@/lib/linear/formatter'
import { db as supabase } from '@/lib/supabase/server'
import { AcceptanceCriterion } from '@/types'

const TEAM_ID = process.env.LINEAR_TEAM_ID!
const COMPLIANCE_LABEL_NAME = 'compliance'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ExportStorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { storyId } = parsed.data

    if (!process.env.LINEAR_API_KEY || !process.env.LINEAR_TEAM_ID) {
      return NextResponse.json(
        { error: { code: 'LINEAR_NOT_CONFIGURED', message: 'Linear is not configured' } },
        { status: 503 }
      )
    }

    // Fetch story from Supabase
    const { data: story, error: storyError } = await supabase
      .from('UserStory')
      .select()
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: { code: 'STORY_NOT_FOUND', message: 'Story not found' } },
        { status: 404 }
      )
    }

    if (story.linearIssueId) {
      return NextResponse.json(
        { error: { code: 'ALREADY_EXPORTED', message: 'Story already exported to Linear' } },
        { status: 409 }
      )
    }

    // Build issue content
    const criteria: AcceptanceCriterion[] = Array.isArray(story.criteria) ? story.criteria : []
    const { title, description, needsComplianceLabel } = formatStoryAsIssue({
      persona: story.persona,
      action: story.action,
      benefit: story.benefit,
      acceptanceCriteria: criteria,
    })

    const linear = getLinearClient()
    const labelIds: string[] = []

    // Find or create compliance label
    if (needsComplianceLabel) {
      const team = await linear.team(TEAM_ID)
      const labelsPage = await team.labels()
      const existing = labelsPage.nodes.find(
        (l) => l.name.toLowerCase() === COMPLIANCE_LABEL_NAME
      )

      if (existing) {
        labelIds.push(existing.id)
      } else {
        const created = await linear.labelCreate({
          name: COMPLIANCE_LABEL_NAME,
          color: '#f97316',
          teamId: TEAM_ID,
        })
        const label = await created.label
        if (label) labelIds.push(label.id)
      }
    }

    // Create the issue
    const issuePayload = await linear.issueCreate({
      title,
      description,
      teamId: TEAM_ID,
      ...(labelIds.length > 0 && { labelIds }),
    })

    const issue = await issuePayload.issue
    if (!issue) {
      return NextResponse.json(
        { error: { code: 'LINEAR_API_ERROR', message: 'Failed to create Linear issue' } },
        { status: 502 }
      )
    }

    // Persist to Supabase
    await supabase
      .from('UserStory')
      .update({ linearIssueId: issue.id, linearIssueUrl: issue.url })
      .eq('id', storyId)

    return NextResponse.json(
      {
        issueId: issue.id,
        issueUrl: issue.url,
        issueIdentifier: issue.identifier,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Linear export error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/sergio/ai-product-mentor && npx tsc --noEmit 2>&1 | grep -i "export\|linear"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/story/export/route.ts
git commit -m "feat: POST /api/story/export route"
```

---

## Task 6: Update `StoryBlock` with export button and badge

**Files:**
- Modify: `src/components/story/StoryBlock.tsx`

- [ ] **Step 1: Rewrite StoryBlock with export state**

Replace the entire content of `src/components/story/StoryBlock.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { UserStory, AcceptanceCriterion } from '@/types'

const categoryColors: Record<AcceptanceCriterion['category'], string> = {
  functional: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  compliance: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  ux: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  performance: 'bg-green-500/20 text-green-300 border-green-500/30',
}

const categoryLabels: Record<AcceptanceCriterion['category'], string> = {
  functional: 'Funcional',
  compliance: 'Compliance',
  ux: 'UX',
  performance: 'Performance',
}

type ExportState = 'idle' | 'loading' | 'exported' | 'error'

type Props = {
  story: Pick<UserStory, 'persona' | 'action' | 'benefit' | 'acceptanceCriteria'>
  storyId?: string
  sessionId?: string
}

export function StoryBlock({ story, storyId, sessionId }: Props) {
  const [exportState, setExportState] = useState<ExportState>('idle')
  const [issueIdentifier, setIssueIdentifier] = useState<string | null>(null)
  const [issueUrl, setIssueUrl] = useState<string | null>(null)

  const handleExport = async () => {
    if (!storyId || !sessionId) return
    setExportState('loading')
    try {
      const res = await fetch('/api/story/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, sessionId }),
      })
      const data = await res.json()
      if (res.ok) {
        setIssueIdentifier(data.issueIdentifier)
        setIssueUrl(data.issueUrl)
        setExportState('exported')
      } else {
        setExportState('error')
      }
    } catch {
      setExportState('error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-white/90 text-sm">{story.persona}</p>
        <p className="text-white/90 text-sm">{story.action}</p>
        <p className="text-white/90 text-sm">{story.benefit}</p>
      </div>

      {story.acceptanceCriteria.length > 0 && (
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-2">
            Critérios de Aceite
          </p>
          <div className="space-y-2">
            {story.acceptanceCriteria.map((ac) => (
              <div key={ac.id} className="flex items-start gap-2">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 mt-0.5 ${categoryColors[ac.category]}`}
                >
                  {categoryLabels[ac.category]}
                </span>
                <p className="text-sm text-white/80">{ac.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {storyId && (
        <div className="pt-1">
          {exportState === 'exported' && issueIdentifier && issueUrl ? (
            <a
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>↗</span>
              <span>{issueIdentifier}</span>
              <span className="text-white/30">· Ver no Linear</span>
            </a>
          ) : exportState === 'error' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Falha ao exportar</span>
              <button
                onClick={handleExport}
                className="text-xs text-white/40 hover:text-white/60 underline transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <button
              onClick={handleExport}
              disabled={exportState === 'loading'}
              className="text-xs text-white/40 hover:text-white/60 underline transition-colors disabled:opacity-50"
            >
              {exportState === 'loading' ? 'Exportando...' : 'Exportar para Linear'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/sergio/ai-product-mentor && npx tsc --noEmit 2>&1 | grep -i "storyblock\|story"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/story/StoryBlock.tsx
git commit -m "feat: add Linear export button to StoryBlock"
```

---

## Task 7: Pass `storyId` and `sessionId` to `StoryBlock` from `MessageBubble`

**Files:**
- Modify: `src/components/chat/MessageBubble.tsx`

- [ ] **Step 1: Update StoryBlock call in MessageBubble**

In `src/components/chat/MessageBubble.tsx`, find the `<StoryBlock story={storyData} />` line and replace it:

```typescript
<StoryBlock
  story={storyData}
  storyId={message.metadata?.storyId}
  sessionId={sessionId}
/>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/sergio/ai-product-mentor && npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/MessageBubble.tsx
git commit -m "feat: pass storyId and sessionId to StoryBlock"
```

---

## Task 8: Configure environment variables

**Files:** k8s deployment, `.env.local` (local dev)

- [ ] **Step 1: Set vars on k8s deployment**

```bash
kubectl set env deployment/aipm -n aipm \
  LINEAR_API_KEY=<sua-linear-api-key> \
  LINEAR_TEAM_ID=<seu-linear-team-id>
```

- [ ] **Step 2: Create `.env.local` for local dev**

```bash
cat >> /home/sergio/ai-product-mentor/.env.local << 'EOF'
LINEAR_API_KEY=<sua-linear-api-key>
LINEAR_TEAM_ID=<seu-linear-team-id>
EOF
```

---

## Task 9: Build and deploy to Kubernetes

**Files:** Docker image, k8s deployment

- [ ] **Step 1: Build production Docker image**

```bash
cd /home/sergio/ai-product-mentor
docker build -t harbor.mvvalvulas.com.br/aipm/aipm:linear-$(git rev-parse --short HEAD) .
```

Expected: `Successfully built ...`

- [ ] **Step 2: Push image to Harbor**

```bash
docker push harbor.mvvalvulas.com.br/aipm/aipm:linear-$(git rev-parse --short HEAD)
```

- [ ] **Step 3: Update k8s deployment image**

```bash
SHORT=$(git rev-parse --short HEAD)
kubectl set image deployment/aipm -n aipm aipm=harbor.mvvalvulas.com.br/aipm/aipm:linear-$SHORT
kubectl rollout status deployment/aipm -n aipm --timeout=120s
```

Expected: `deployment "aipm" successfully rolled out`

- [ ] **Step 4: Verify pods are healthy**

```bash
kubectl get pods -n aipm
```

Expected: all pods `1/1 Running`, 0 restarts.

---

## Task 10: Smoke test in browser

- [ ] **Step 1: Open the app and generate a story**

Navigate to `https://aipm.mvvalvulas.com.br/onboarding`, complete onboarding, switch to "Gerar User Story", generate a story.

- [ ] **Step 2: Verify export button appears**

The StoryBlock should show "Exportar para Linear" button at the bottom.

- [ ] **Step 3: Click export and verify badge**

Click the button. After a few seconds the button should be replaced by `↗ AGR-N · Ver no Linear` (or the team's prefix). Click the link — it should open the issue in Linear.

- [ ] **Step 4: Verify no re-export is possible**

Refresh the page (badge disappears — expected). Generate the same story description again and try to export a second time — confirm a new issue IS created (since it's a new storyId each time).

- [ ] **Step 5: Verify compliance label in Linear**

Open the created issue in Linear. If the story has compliance ACs, confirm the `compliance` label is applied (orange color).
