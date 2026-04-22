# AI Project Mentor — MVP Specs

> **Metodologia:** Spec-Driven Development (SDD)
> Cada feature é construída spec-primeiro: você define o contrato (tipos, comportamento, erros) antes de escrever uma linha de código de implementação.

---

## Estrutura de Pastas

```
specs/
├── README.md                   ← este arquivo
│
├── 00-foundation/
│   ├── ARCHITECTURE.md         ← visão geral da arquitetura
│   ├── DATA-MODELS.md          ← tipos e schemas centrais
│   ├── API-CONTRACTS.md        ← contratos de todos os endpoints
│   └── INFRA.md                ← stack, variáveis de ambiente, deploy
│
├── 01-onboarding/
│   ├── SPEC.md                 ← spec completa da feature F1
│   ├── FLOWS.md                ← fluxos e estados
│   └── TESTS.md                ← casos de teste e critérios de aceite
│
├── 02-user-story-linter/
│   ├── SPEC.md                 ← spec completa da feature F2
│   ├── LINTER-RULES.md         ← regras de compliance e semáforo
│   └── TESTS.md
│
├── 03-feedback/
│   ├── SPEC.md                 ← spec completa da feature F3
│   └── TESTS.md
│
└── 04-shared/
    ├── COMPONENTS.md           ← componentes de UI reutilizáveis
    └── ERRORS.md               ← catálogo de erros padronizados
```

---

## Como usar este repositório de Specs

### Ordem de leitura obrigatória antes de codar qualquer feature:

1. `00-foundation/ARCHITECTURE.md` — entenda o sistema como um todo
2. `00-foundation/DATA-MODELS.md` — internalize os tipos antes de criar qualquer coisa
3. `00-foundation/API-CONTRACTS.md` — os contratos são a lei; não desvie sem atualizar a spec
4. `[feature]/SPEC.md` — a spec da feature que você vai construir
5. `[feature]/TESTS.md` — escreva os testes antes da implementação

### Convenções

- **Spec antes de código:** nenhuma implementação começa sem spec aprovada
- **Tipos explícitos:** TypeScript estrito em todo o projeto (`strict: true`)
- **Nenhum `any`:** se você precisar de `any`, é sinal de que a spec está incompleta
- **Erros são contratos:** todos os erros possíveis estão documentados em `04-shared/ERRORS.md`
- **Um endpoint, uma responsabilidade:** nenhum endpoint faz mais do que o seu nome indica

---

## Sprints do MVP

| Sprint | Features | Specs |
|--------|----------|-------|
| 1 | Setup + F3 (Feedback) | `00-foundation` + `03-feedback` |
| 2–3 | F1 (Onboarding) | `01-onboarding` |
| 3–4 | F2 (User Story + Linter) | `02-user-story-linter` |
| 5 | Integração + Hardening | Todos |
