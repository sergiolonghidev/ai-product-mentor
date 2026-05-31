# TESTS-05 — Job Picker

## Casos de teste

### T05-01: Render dos 4 cards
- Acessar `/`
- Verificar que 4 cards são renderizados
- Verificar que os títulos são: "Criar User Story", "Escrever PRD", "Planejar Roadmap", "Pesquisar Concorrentes"

### T05-02: Card ativo navega corretamente
- Clicar em "Criar User Story"
- URL muda para `/onboarding`
- OnboardingWizard renderiza normalmente

### T05-03: Cards "em breve" não são clicáveis
- Clicar em "Escrever PRD"
- URL não muda
- Nenhum erro no console

### T05-04: Badge "Em breve" visível
- Inspeção visual: cards inativo exibem texto "Em breve" ou badge equivalente
- Opacity ou estilo diferenciado em relação ao card ativo

### T05-05: Fluxo completo sem regressão
- Home → Criar User Story → Onboarding (3 passos) → Chat → Gerar US → Export Linear
- Fluxo completo sem erro
