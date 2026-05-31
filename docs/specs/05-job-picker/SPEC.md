# SPEC-05 — Job Picker (Home Screen)
**ProdPilot AI · V2**
`Corresponde a: CA#11`

---

## Objetivo

Substituir o redirect direto `/` → `/onboarding` por uma tela de seleção de Job.
O PM escolhe o que quer fazer; apenas "Criar User Story" é navegável no V2.
Os demais Jobs aparecem com indicação visual de "em breve".

---

## Fluxo

```
/ (Home)
└── Job Picker
    ├── "Criar User Story"  → /onboarding → /chat  (ATIVO)
    ├── "Escrever PRD"      → desabilitado "em breve" (V2 começa aqui se EC-01 aprovado)
    ├── "Planejar Roadmap"  → desabilitado "em breve"
    └── "Pesquisar Concorrentes" → desabilitado "em breve"
```

> **Nota:** Quando EC-01 (PRD Generation) for implementado, "Escrever PRD" passa a ATIVO
> e redireciona para `/prd/onboarding`.

---

## Componentes

### `app/page.tsx`
Remove o `redirect('/onboarding')` e renderiza `<JobPicker />`.

### `components/job-picker/JobPicker.tsx`
Grid de cards. Props: nenhuma (jobs são estáticos no V2).

### `components/job-picker/JobCard.tsx`
```typescript
type JobCardProps = {
  icon: string          // emoji ou SVG
  title: string
  description: string   // 1 linha — o que o job resolve
  status: 'active' | 'soon'
  href?: string         // só quando status === 'active'
}
```

Comportamento:
- `active`: card clicável, navega para `href`
- `soon`: card com overlay "Em breve", cursor `not-allowed`, sem click

---

## Jobs definidos (V2)

| Job | Icon | Description | Status |
|---|---|---|---|
| Criar User Story | 📝 | Gere histórias com critérios e compliance | active |
| Escrever PRD | 📄 | Documente features com contexto regulatório | soon |
| Planejar Roadmap | 🗺️ | Organize prioridades e entregas | soon |
| Pesquisar Concorrentes | 🔍 | Analise mercado e benchmarks | soon |

---

## Critérios de aceite (CA#11)

- [ ] Tela inicial exibe os 4 jobs sem que o PM precise navegar para outro lugar
- [ ] Cards "em breve" têm indicação visual distinta (opacity reduzida + badge "Em breve")
- [ ] Card "em breve" não é clicável e não emite erro no console
- [ ] Card "Criar User Story" navega para `/onboarding`
- [ ] Sem regressão: onboarding e chat continuam funcionando normalmente

---

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/app/page.tsx` | Substituir `redirect` por render de `<JobPicker />` |
| `src/components/job-picker/JobPicker.tsx` | Criar |
| `src/components/job-picker/JobCard.tsx` | Criar |

---

## Não está no escopo deste spec

- Autenticação por Job
- Roteamento dinâmico de jobs por feature flag
- Animações de transição entre jobs
