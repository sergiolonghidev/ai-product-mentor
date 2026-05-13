import { SessionContext, UserStory } from '@/types'

export function buildLinterPrompt(story: UserStory, context: SessionContext, playbookRules: string): string {
  const criteriaText = story.acceptanceCriteria
    .map(c => `- [${c.category}] ${c.description}`)
    .join('\n')

  return `
Você é um especialista em compliance regulatório para produtos de cartão de crédito no Brasil.

Analise a User Story abaixo e identifique riscos regulatórios com base nas regras do playbook.

PLAYBOOK DE REGRAS:
${playbookRules || 'Nenhuma regra carregada. Use conhecimento geral de compliance BCB.'}

USER STORY:
Persona: ${story.persona}
Ação: ${story.action}
Benefício: ${story.benefit}

Critérios de Aceite:
${criteriaText}

Contexto do squad:
- Squad: ${context.squad}
- Tipo: ${context.functionalityType}

Retorne um JSON com a seguinte estrutura:
{
  "risks": [
    {
      "id": "risk-1",
      "level": "red | amber | green",
      "title": "[título curto do risco]",
      "description": "[explicação do problema regulatório]",
      "normativeReference": "[ex: Resolução BCB nº 96/2021, Art. 7º]",
      "suggestion": "[o que o PM deve adicionar/corrigir]",
      "affectedCriteria": ["ac-1", "ac-2"]
    }
  ]
}

Regras importantes:
- Máximo 2 riscos de nível "red". Se houver mais, agrupe os demais em 1 único "amber"
- Use "green" para indicar itens que estão corretamente cobertos
- Não acione um risco se o critério já está coberto (mesmo que indiretamente)
- Retorne APENAS o JSON válido, sem markdown
`.trim()
}
