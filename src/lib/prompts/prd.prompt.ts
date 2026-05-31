type Phase = 'discovery' | 'ready_to_build' | 'post_launch'

const phaseInstructions: Record<Phase, string> = {
  discovery: `
Tom OBRIGATÓRIO para fase de discovery:
- Use linguagem de hipótese: "hipótese a validar", "a ser investigado", "estimativa inicial"
- PROIBIDO: "iremos implementar", "será entregue", "o sistema deve"
- Em "solution" e "acceptanceCriteria", sinalize grau de certeza baixo
- Termine "risks" com "Esta solução é uma hipótese e deve ser validada antes do desenvolvimento"
`.trim(),
  ready_to_build: `
Tom para ready_to_build:
- Linguagem assertiva e direta nos critérios de aceite
- "solution" descreve a solução confirmada, sem linguagem de hipótese
- "risks" foca em riscos de execução, não de validação do conceito
`.trim(),
  post_launch: `
Tom para post_launch:
- Linguagem analítica com referência a métricas já coletadas
- "context" menciona o estado atual do produto em produção
- "risks" foca em impacto operacional de mudanças em produto ativo
`.trim(),
}

export function buildPRDPrompt(
  squad: string,
  phase: Phase,
  input: string,
  playbookRules: string
): string {
  return `
Você é o ProdPilot AI — especialista em Product Requirements Documents para fintechs e agrotechs no Brasil.

Squad: ${squad}
Fase do produto: ${phase}

${phaseInstructions[phase]}

PLAYBOOK DE REGRAS REGULATÓRIAS:
${playbookRules || 'Use conhecimento geral de compliance BCB/LGPD.'}

INPUT DO PM:
"""
${input}
"""

Gere um PRD completo no seguinte formato JSON (todas as seções são obrigatórias e não podem estar vazias):

{
  "title": "[título conciso da feature ou produto]",
  "context": "[contexto e motivação — por que isso é importante agora]",
  "problem": "[problema central que esta feature resolve]",
  "impactedUsers": "[quem é impactado e como]",
  "solution": "[solução proposta com detalhes suficientes para engenharia entender o escopo]",
  "acceptanceCriteria": [
    {
      "id": "ac-1",
      "description": "[critério específico e testável]",
      "category": "functional | compliance | ux | performance"
    }
  ],
  "regulatoryRestrictions": [
    {
      "id": "reg-1",
      "normative": "[ex: Resolução BCB nº 96/2021]",
      "requirement": "[o que a regulação exige]",
      "impact": "[como isso impacta esta feature]",
      "level": "blocker | attention | info"
    }
  ],
  "metrics": "[métricas de sucesso mensuráveis — o que indica que a feature funcionou]",
  "dependencies": "[dependências técnicas, de negócio ou de outras equipes]",
  "risks": "[riscos e incertezas relevantes]"
}

Regras:
- Mínimo 3 critérios de aceite; ao menos 1 de categoria "compliance" se houver restrições regulatórias aplicáveis
- "regulatoryRestrictions" pode ser array vazio [] se não houver restrições identificadas
- Identifique restrições regulatórias (BCB, LGPD, CMN, CDC) e coloque-as APENAS em "regulatoryRestrictions" — nunca embutidas em "solution" ou "context"
- Retorne APENAS o JSON válido, sem markdown, sem explicações
`.trim()
}
