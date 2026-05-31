# TESTS-07 — Linear Handoff V2

## T07-01: Épico de compliance separado (CA#6)

Setup: Sessão com 3 USs — 2 com AC de compliance, 1 sem
- `POST /api/handoff/plan` retorna 2 épicos: "Desenvolvimento" e "Compliance"
- USs com AC compliance estão no épico "Compliance"
- US sem compliance está no épico "Desenvolvimento"
- Nenhum issue de compliance no épico de desenvolvimento

## T07-02: Alerta de analytics (CA#7)

Setup: Sessão sem nenhuma menção a tracking/analytics em ACs
- Banner amarelo visível no HandoffPlanner
- Texto: "Nenhum issue de tracking identificado"
- Botão "+ Adicionar issue de analytics" visível

## T07-03: Criar issue de analytics (CA#7)

- Clicar em "+ Adicionar issue de analytics"
- Nova US pré-preenchida aparece no plano (épico desenvolvimento)
- Persona/action/benefit referem tracking do fluxo em questão

## T07-04: Sem alerta quando analytics presente (CA#7)

Setup: AC com description "Rastrear evento de clique no botão de adesão"
- Banner de alerta NÃO aparece

## T07-05: Renomear épico (CA#8)

- Clicar no título do épico
- Input inline aparece com o nome atual
- Editar e pressionar Enter / blur
- Título atualizado na UI

## T07-06: Mover issue entre épicos (CA#8)

- Dropdown em IssueRow mostra os épicos disponíveis
- Selecionar épico diferente
- Issue move para o novo épico
- Issue desaparece do épico original

## T07-07: Remover issue do plano (CA#8)

- Clicar em remover issue
- Issue marcada como removida (riscada ou oculta)
- "Desfazer" disponível até confirmar export
- Após export, issue removida não é criada no Linear

## T07-08: Spike naming (CA#9)

Setup: US com action contendo "investigar viabilidade de..."
- No plano, issue exibe badge "Spike"
- Após export, título no Linear tem prefixo "[Spike]"

## T07-09: Marcar spike manualmente (CA#9)

- Toggle "Spike" em uma US não detectada automaticamente
- Badge "Spike" aparece
- Após export, prefixo "[Spike]" no título do Linear

## T07-10: Modal de confirmação (CA#10)

- Clicar "Enviar ao Linear"
- Modal abre com lista de épicos + count de issues
- Workspace Linear exibido
- Checklist com 3 itens visível

## T07-11: Export bloqueado sem checklist (CA#10)

- Modal aberta sem marcar checklist
- Botão "Confirmar e enviar" desabilitado
- Após marcar todos os itens, botão habilitado

## T07-12: Aviso de irreversibilidade (CA#10)

- Texto de aviso sobre ação irreversível visível no modal
- Após confirmar: issues criados no Linear corretamente
- Links ↗ aparecem nas USs exportadas

## T07-13: Erros parciais não bloqueiam o resto

Setup: Mock Linear API falha para 1 issue
- Export continua para as demais
- Resultado exibe issues com sucesso + issues com erro
- PM pode tentar re-exportar os com erro
