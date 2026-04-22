# LINTER-RULES.md — Regras de Compliance e Semáforo

> Este arquivo é a fonte da verdade para as regras de compliance que o linter verifica.
> É injetado no prompt do linter via `lib/playbook/loader.ts`.
> Atualizar este arquivo requer revisão do time de Compliance/Jurídico (pós-MVP).

---

## Estrutura de uma Regra

```typescript
type LinterRule = {
  id: string
  name: string
  defaultLevel: 'red' | 'amber' | 'green'
  functionalityTypes: FunctionalityType[] | 'all'  // quais tipos se aplicam
  normativeReference: string
  description: string            // explicação técnica
  checkDescription: string       // o que o linter deve verificar na story
  suggestion: string             // o que o PM deve fazer para corrigir
  falsePositiveGuard: string     // instrução para evitar falso positivo
}
```

---

## Regras Ativas no MVP

### RULE-001: CET Ausente
```
id: rule-001
name: Custo Efetivo Total (CET) não mencionado
defaultLevel: red
functionalityTypes: [fatura, parcelamento, limite, aquisicao]
normativeReference: Resolução BCB nº 96/2021, Art. 7º
description: >
  Operações de crédito devem informar o CET de forma clara e destacada 
  antes da contratação. A ausência de critério de aceite que exija a 
  exibição do CET é um risco regulatório crítico.
checkDescription: >
  Verificar se há ao menos um critério de aceite que exija a exibição 
  do CET (Custo Efetivo Total) na interface.
suggestion: >
  Adicione um critério de aceite do tipo: "O CET deve ser exibido de 
  forma destacada [contexto específico], antes que o usuário confirme 
  a operação."
falsePositiveGuard: >
  Não acione este risco se o CET for mencionado de qualquer forma nos 
  critérios de aceite, mesmo que indiretamente (ex: "custo total", 
  "encargos totais da operação").
```

### RULE-002: Ausência de Critério de Desistência
```
id: rule-002
name: Direito de desistência não contemplado
defaultLevel: red
functionalityTypes: [parcelamento, aquisicao, limite]
normativeReference: Resolução BCB nº 96/2021, Art. 4º; CDC Art. 49
description: >
  O consumidor tem direito de desistir de operações de crédito. 
  Fluxos de contratação devem prever pelo menos uma etapa de 
  confirmação e opção de cancelamento antes da efetivação.
checkDescription: >
  Verificar se há critério de aceite contemplando a possibilidade de 
  o usuário desistir ou cancelar antes de confirmar a contratação.
suggestion: >
  Adicione um critério como: "O usuário pode cancelar o processo até 
  a etapa de confirmação final, sem cobrança ou penalidade."
falsePositiveGuard: >
  Não acione se a story é de visualização/consulta apenas, sem 
  contratação ou efetivação de operação financeira.
```

### RULE-003: Taxa de Juros Não Mencionada
```
id: rule-003
name: Taxa de juros ausente em operação de crédito
defaultLevel: red
functionalityTypes: [parcelamento, limite]
normativeReference: Resolução CMN nº 3.919/2010; Resolução BCB nº 96/2021
description: >
  Qualquer operação de crédito deve informar claramente a taxa de 
  juros aplicada (ao mês e ao ano).
checkDescription: >
  Verificar se há critério que exija exibição da taxa de juros 
  (mensal e anual) na interface.
suggestion: >
  Adicione: "A taxa de juros (a.m. e a.a.) deve ser exibida de forma 
  clara antes da confirmação da operação."
falsePositiveGuard: >
  Não acione se a story é de funcionalidade isenta de juros 
  (ex: pagamento à vista da fatura).
```

### RULE-004: Data de Vencimento em Fatura
```
id: rule-004
name: Data de vencimento não contemplada
defaultLevel: amber
functionalityTypes: [fatura]
normativeReference: Resolução BCB nº 96/2021
description: >
  O portador do cartão deve ter acesso claro à data de vencimento 
  da fatura em qualquer tela relacionada a pagamento.
checkDescription: >
  Verificar se há critério mencionando exibição da data de vencimento.
suggestion: >
  Adicione: "A data de vencimento da fatura deve ser exibida em 
  destaque na [tela específica]."
falsePositiveGuard: >
  Não acione se a story não envolve exibição de fatura ou pagamento.
```

### RULE-005: Ausência de Critério de Acessibilidade
```
id: rule-005
name: Acessibilidade não contemplada
defaultLevel: amber
functionalityTypes: all
normativeReference: Lei 13.146/2015 (Lei Brasileira de Inclusão)
description: >
  Produtos digitais de instituições financeiras devem ser acessíveis 
  para pessoas com deficiência.
checkDescription: >
  Verificar se há qualquer critério relacionado a acessibilidade 
  (leitor de tela, contraste, navegação por teclado).
suggestion: >
  Adicione: "A funcionalidade deve ser navegável por leitor de tela 
  (VoiceOver/TalkBack) e atender WCAG 2.1 AA."
falsePositiveGuard: >
  Não acione se a story é de backend/API sem interface de usuário.
```

### RULE-006: Persona Genérica
```
id: rule-006
name: Persona muito genérica
defaultLevel: amber
functionalityTypes: all
normativeReference: Boa prática de PM
description: >
  Personas vagas ("o usuário", "o cliente") reduzem a precisão 
  dos critérios de aceite e dificultam o alinhamento com UX e Dev.
checkDescription: >
  Verificar se a persona da User Story é específica o suficiente 
  para o contexto (ex: "portador do cartão", "PM do squad de aquisição").
suggestion: >
  Substitua a persona genérica por uma mais específica ao contexto 
  do squad e do produto.
falsePositiveGuard: >
  Não acione se a persona for tecnicamente específica mesmo sendo 
  concisa (ex: "portador do cartão", "cliente pessoa física").
```

---

## Como o Loader Funciona

```typescript
// lib/playbook/loader.ts

import { readFileSync } from 'fs'
import { join } from 'path'

export function loadPlaybookRules(functionalityType: FunctionalityType): string {
  // Lê o arquivo de regras (este arquivo em formato processável)
  // Filtra apenas as regras aplicáveis ao tipo de funcionalidade
  // Retorna string formatada para injeção no prompt
  
  const rules = ALL_RULES.filter(
    rule => rule.functionalityTypes === 'all' || 
            rule.functionalityTypes.includes(functionalityType)
  )
  
  return rules.map(rule => `
REGRA ${rule.id}: ${rule.name}
Nível: ${rule.defaultLevel.toUpperCase()}
Normativo: ${rule.normativeReference}
O que verificar: ${rule.checkDescription}
Sugestão de correção: ${rule.suggestion}
Evitar falso positivo: ${rule.falsePositiveGuard}
  `.trim()).join('\n\n---\n\n')
}
```

---

## Adicionando Novas Regras (pós-MVP)

1. Adicionar entrada em `LINTER-RULES.md` seguindo o schema acima
2. Adicionar o objeto correspondente em `lib/playbook/rules.ts`
3. Testar com pelo menos 3 User Stories reais (1 que deve acionar, 2 que não devem)
4. Obter revisão do time de Compliance antes de ativar em produção
5. Atualizar a data de validade da regra (campo `lastValidatedAt` no Painel de Saúde — pós-MVP)
