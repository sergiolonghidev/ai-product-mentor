# TESTS-08 — PRD Generation

## T08-01: Seções obrigatórias presentes (CA#1)

Setup: Input de 400 palavras sobre feature de tokenização
- PRD gerado contém: context, problem, impactedUsers, solution, acceptanceCriteria,
  regulatoryRestrictions, metrics, dependencies, risks
- Nenhuma seção está vazia

## T08-02: Restrições em seção dedicada (CA#2)

- RegulatoryCard exibido ANTES dos critérios de aceite
- Cada restrição tem badge de level (blocker/attention/info)
- Texto de `solution` e `context` NÃO contém texto de restrição regulatória embutido

## T08-03: Sem restrições exibe nota (CA#2)

Setup: Input sem conteúdo regulatório explícito
- Seção exibe: "Nenhuma restrição regulatória identificada. Revise manualmente."

## T08-04: Tom de discovery (CA#3)

Setup: `phase = 'discovery'`
- Pelo menos uma instância de: "hipótese", "a validar", "investigar", "estimativa"
- NÃO contém: "iremos implementar", "será entregue", "o sistema deve"

## T08-05: Tom assertivo em ready_to_build (CA#3)

Setup: `phase = 'ready_to_build'`
- Linguagem mais diretiva nos critérios de aceite
- Ausência de linguagem de hipótese nas seções de solução e critérios

## T08-06: Edição inline de seção (CA#4)

- Clicar em qualquer seção do PRD
- Textarea inline aparece com o conteúdo atual
- Editar e salvar seção
- `PATCH /api/prd/:id` chamado com apenas a seção editada
- View mode exibe novo conteúdo sem recarregar página

## T08-07: Salvar seção individual não afeta outras (CA#4)

- Editar `context` e salvar
- `problem` e demais seções mantêm conteúdo original

## T08-08: Geração em ≤30s (CA#5)

Setup: Input de 500 palavras (simular ata de reunião)
- Medir tempo desde submit até `prd_complete` event
- Deve ser ≤ 30000ms
- Testar 3 vezes e verificar que a média é ≤30s

## T08-09: Cancelar edição descarta draft (CA#4)

- Editar seção `solution`
- Clicar Cancelar
- Conteúdo original restaurado, `PATCH` não chamado

## T08-10: Restrição editável (CA#4)

- Clicar em uma restrição regulatória
- Campos `requirement` e `impact` ficam editáveis
- Salvar persiste via PATCH com `regulatoryRestrictions` atualizado

## T08-11: Job Picker habilita "Escrever PRD"

- Com spec 08 implementado, card "Escrever PRD" no Job Picker muda de `soon` para `active`
- Clicar navega para `/prd/onboarding`
