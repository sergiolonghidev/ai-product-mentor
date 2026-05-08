# Linear Integration Design

**Date:** 2026-05-08
**Feature:** Export User Story to Linear.app

---

## Goal

Allow a PM to export a generated User Story as a Linear issue with one click. The issue is created once; the button is replaced by a permanent badge showing the issue identifier and a link.

---

## Architecture

### New files

| File | Responsibility |
|---|---|
| `src/lib/linear/client.ts` | Singleton `LinearClient` from `@linear/sdk`, reads `LINEAR_API_KEY` |
| `src/lib/linear/formatter.ts` | Builds issue title, Markdown description, detects compliance label need |
| `src/app/api/story/export/route.ts` | `POST /api/story/export` handler |

### Modified files

| File | Change |
|---|---|
| `src/components/story/StoryBlock.tsx` | Add `storyId?`, `sessionId?` props; export button and badge |
| `src/components/chat/MessageBubble.tsx` | Pass `storyId` and `sessionId` to `StoryBlock` |

---

## API Route: `POST /api/story/export`

### Request body
```ts
{ storyId: string, sessionId: string }
```

### Flow
1. Fetch `UserStory` from Supabase by `storyId` — `404` if not found
2. Return `409` if `linearIssueId` already set (already exported)
3. Call `formatter.ts` — build title, Markdown description, detect compliance ACs
4. If story has any AC with `category === 'compliance'`:
   - Fetch team labels from Linear (`team.labels`)
   - Create label `"compliance"` if it does not exist (`labelCreate`)
   - Collect label ID for issue creation
5. Create issue via `linearClient.issueCreate({ title, description, teamId, labelIds })`
6. On Linear success: `UPDATE UserStory SET linearIssueId, linearIssueUrl` in Supabase
7. Return `{ issueId, issueUrl, issueIdentifier }` — `issueIdentifier` is the human-readable ID (e.g. `ENG-42`)

### Error responses

| Condition | Status | Code |
|---|---|---|
| `LINEAR_API_KEY` not set | 503 | `LINEAR_NOT_CONFIGURED` |
| Story not found | 404 | `STORY_NOT_FOUND` |
| Already exported | 409 | `ALREADY_EXPORTED` |
| Linear API error | 502 | `LINEAR_API_ERROR` |
| Unexpected | 500 | `INTERNAL_ERROR` |

---

## Issue Format

### Title
```
Como [persona], quero [action]
```

### Description (Markdown)
```markdown
## User Story
**Como** [persona], **quero** [action], **para** [benefit].

## Critérios de Aceite
- **[Funcional]** description
- **[Compliance]** description
- **[UX]** description
- **[Performance]** description
```

### Label
- Applied only if the story contains at least one AC with `category === 'compliance'`
- Label name: `"compliance"` (created in the team if absent)

---

## StoryBlock Component

### New props
```ts
type Props = {
  story: Pick<UserStory, 'persona' | 'action' | 'benefit' | 'acceptanceCriteria'>
  storyId?: string
  sessionId?: string
}
```

### Export button behavior
- Visible only when `storyId` is provided (story was persisted to DB)
- States: `idle` → `loading` → `exported`
- In `exported`: button replaced by badge `↗ ENG-42` (link to `issueUrl`, opens in new tab)
- State is in-memory (ephemeral); refreshing the page clears the badge, but the issue persists in Linear

### Error state
- If export API returns error: button returns to `idle`, brief error text shown inline ("Falha ao exportar")

---

## Environment Variables

```
LINEAR_API_KEY=lin_api_...       # Personal or OAuth token with write access
LINEAR_TEAM_ID=...               # UUID of the target team
```

Both must be present. If absent, the export button is hidden (checked via `/api/story/export` returning 503) or disabled server-side.

---

## Dependencies

```
@linear/sdk   # Official Linear TypeScript SDK
```

Install: `npm install @linear/sdk`

---

## Out of scope (MVP)

- Syncing Linear issue status back to the app
- Attaching lint results to the issue
- Choosing the team/project at export time
- Re-export or update of an existing issue
