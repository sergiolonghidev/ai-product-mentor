# TESTS-06 — Story Editor

## T06-01: Formato inválido exibe banner (CA#12)

Setup: Mock `story_complete` com `persona = "Usuário quer..."` (sem "Como ")
- Banner "Formato fora do padrão" é visível
- US ainda é exibida (não bloqueada)
- Export continua disponível

## T06-02: Formato válido não exibe banner

Setup: US com persona "Como PM de aquisição...", action "Quero...", benefit "Para que..."
- Nenhum banner de formato

## T06-03: Critério genérico exibe aviso (CA#13)

Setup: AC com description "O sistema deve funcionar corretamente"
- Ícone `⚠` visível ao lado do badge de categoria
- Tooltip ou label "Critério muito genérico"

## T06-04: Botão Editar entra no edit mode (CA#15)

- Clicar em "Editar"
- persona, action, benefit se tornam textareas
- ACs exibem campo de texto editável + botão X

## T06-05: Salvar persiste mudanças (CA#15)

- Editar persona para "Como PM sênior de compliance..."
- Clicar Salvar
- `PATCH /api/story/:id` chamado com nova persona
- View mode exibe nova persona
- Linter re-executa (spinner visível)

## T06-06: Cancelar descarta draft (CA#15)

- Editar action para texto diferente
- Clicar Cancelar
- View mode exibe action original

## T06-07: Remover AC com mínimo 1 restante (CA#15)

Setup: US com 3 ACs
- Remover 2 ACs: permitido
- Ao tentar remover o último AC: botão X desabilitado ou erro inline

## T06-08: Adicionar novo AC (CA#15)

- Clicar "+ Adicionar critério"
- Campo de texto aparece com selector de categoria
- Após preencher e salvar, AC aparece na lista
- Linter re-executa

## T06-09: Export bloqueado durante edit mode

- Clicar Editar
- Botão "Exportar para Linear" não disponível (hidden ou disabled)
