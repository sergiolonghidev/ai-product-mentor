# AI Project Mentor — MVP Specs

> **Metodologia:** Spec-Driven Development (SDD)
> Cada feature é construída spec-primeiro: você define o contrato (tipos, comportamento, erros) antes de escrever uma linha de código de implementação.

---

## Estrutura de Pastas

```
docs/
├── prd/
│   ├── AI_Project_Mentor_PRD_MVP.md ← Visão geral, objetivos, MVP
│   └── Documento-pre-PRD.md         ← Draft inicial / Pré-PRD
├── planning/
│   └── SPRINT-PLAN.md               ← Planejamento das Sprints
└── specs/
    ├── 00-foundation/               ← Arquitetura, Contratos API, Prompts e Infra
    ├── 01-onboarding/               ← Especificações de Onboarding
    ├── 02-user-story-linter/        ← Especificações do Gerador e Linter
    ├── 03-feedback/                 ← Especificações do Sistema de Feedback
    └── 04-shared/                   ← Componentes UI e Erros padrão
```

---

## Como usar este repositório de Specs

### Ordem de leitura obrigatória antes de codar qualquer feature:

1. `docs/specs/00-foundation/ARCHITECTURE.md` — entenda o sistema como um todo
2. `docs/specs/00-foundation/DATA-MODELS.md` — internalize os tipos antes de criar qualquer coisa
3. `docs/specs/00-foundation/API-CONTRACTS.md` — os contratos são a lei; não desvie sem atualizar a spec
4. `docs/specs/[feature]/SPEC.md` — a spec da feature que você vai construir
5. `docs/specs/[feature]/TESTS.md` — escreva os testes antes da implementação

### Convenções

- **Spec antes de código:** nenhuma implementação começa sem spec aprovada
- **Tipos explícitos:** TypeScript estrito em todo o projeto (`strict: true`)
- **Nenhum `any`:** se você precisar de `any`, é sinal de que a spec está incompleta
- **Erros são contratos:** todos os erros possíveis estão documentados em `docs/specs/04-shared/ERRORS.md`
- **Um endpoint, uma responsabilidade:** nenhum endpoint faz mais do que o seu nome indica

---

## Sprints do MVP

| Sprint | Features | Specs |
|--------|----------|-------|
| 1 | Setup + F3 (Feedback) | `00-foundation` + `03-feedback` |
| 2–3 | F1 (Onboarding) | `01-onboarding` |
| 3–4 | F2 (User Story + Linter) | `02-user-story-linter` |
| 5 | Integração + Hardening | Todos |
