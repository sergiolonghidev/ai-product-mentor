# PRD — Product Requirements Document
**ProdPilot AI · MVP**
`v1.1 · Mai 2025` · Status: Aprovado para desenvolvimento

---

## Visão geral

**Produto:** ProdPilot AI — MVP
**Escopo:** EC-04 (Geração de User Stories) + EC-03 (Handoff para o Linear)
**Fora do escopo (V2):** EC-01 (Geração de PRD) · EC-02 (Camada PII)

Copiloto agêntico que gera User Stories estruturadas a partir de descrições ou atas de reunião e as sincroniza automaticamente no Linear — eliminando o trabalho manual de escrita de histórias e handoff para times de produto em Fintechs e Agrotechs.

---

## 01 · Problema central

PMs de Fintechs e Agrotechs gastam horas por semana escrevendo User Stories manualmente, criando issues no Linear um a um e validando restrições regulatórias sem suporte. Em ambientes regulados (Bacen, MCR, LGPD), esse trabalho é ainda mais lento porque restrições raramente são documentadas proativamente — gerando risco de não-conformidade e retrabalho tardio com jurídico e compliance.

| Métrica | Valor |
|---|---|
| Tempo médio por set de USs (manual) | 2–5h |
| NPS médio nos testes sintéticos | 8,6 / 10 |
| Tempo de handoff p/ Linear | 1h30–3h |
| Testes que capturaram risco regulatório | 5 de 5 |

---

## 02 · Escopo do MVP

**Fluxo principal:**
```
Descrição ou ata → Geração de USs → Revisão humana → Aprovação → Linear ✓
```

### EC-04 · Core do MVP — Geração de User Stories
- Input: descrição de funcionalidade ou ata de reunião
- Geração de USs no formato "Como [persona], quero [ação] para [benefício]" com critérios de aceite por história
- Restrições regulatórias (Bacen, MCR, LGPD) incorporadas nas USs geradas
- Edição inline de cada US antes de aprovar

### EC-03 · Handoff para o Linear (incluso no MVP)
- USs aprovadas enviadas ao Linear como issues individuais
- Épico de compliance separado automaticamente
- Alerta de issue de analytics faltando
- Aprovação 1 clique + sync Linear

### Fora do MVP
- **EC-01 → V2:** Geração de PRD. Mesmo fluxo agêntico — endereçado após validação do core em beta.
- **EC-02 → V2:** Camada de PII. Pré-requisito para adoção bancária. Marcos (teste sintético): "NPS vira 9 imediatamente se a arquitetura de dados estiver correta."

---

## 03 · Critérios de aceite — 16 itens com rastreabilidade

### EC-01 — Geração de PRD _(V2 — referência)_

> Os itens abaixo estão fora do MVP mas documentados para guiar o desenvolvimento da V2.

**CA #1**
User Stories geradas incluem obrigatoriamente: contexto, problema, usuários impactados, solução, critérios de aceite, restrições regulatórias, métricas, dependências e riscos.
_Fonte: padrão identificado nos 5 testes_

**CA #2**
Restrições regulatórias (Bacen, MCR, LGPD, CDC) identificadas automaticamente e exibidas em seção destacada — nunca embutidas no corpo sem destaque.
_Fonte: Rafael (omissão por pressa), Ana Clara (CPR/MCR), Marcos (aprovação SI)_

**CA #3**
Tom do PRD reconhece incerteza em fases de discovery — usar linguagem como "hipótese a validar" em vez de tom assertivo de entrega.
_Fonte: Julia — "parece que a gente já sabe o que fazer, mas não sabe ainda"_

**CA #4**
PM consegue editar qualquer campo do PRD inline antes de aprovar, sem sair do fluxo.
_Fonte: Rafael (2 ajustes), Ana Clara (1 ajuste)_

**CA #5**
Tempo de geração do PRD ≤ 30 segundos para uma ata de 400–600 palavras.
_Fonte: critério de performance definido no EC-01_

---

### EC-03 — Handoff para o Linear

**CA #6**
Issues de compliance gerados em épico próprio, separado dos épicos de desenvolvimento — nunca misturados no mesmo épico técnico.
_Fonte: padrão unânime nos 5 testes_

**CA #7**
Sistema alerta quando issue de analytics/tracking não foi gerado — PM adiciona com 1 clique antes de enviar ao Linear.
_Fonte: Rafael — "faltou issue de tracking, gap crítico para validar a métrica principal"_

**CA #8**
PM consegue reorganizar, renomear, editar e deletar épicos e issues individualmente antes de aprovar o envio.
_Fonte: Ana Clara (reordenação MCR/LGPD), Marcos (PII no topo), Thiago (issues de comunicação)_

**CA #9**
Issues do tipo "spike" ou "investigação" são nomeados como tal — não como entregáveis de desenvolvimento.
_Fonte: Ana Clara — "isso é investigação, não entrega"_

**CA #10**
Tela de confirmação antes do envio exibe: épicos, issues, workspace Linear e checklist — com aviso de ação irreversível.
_Fonte: Thiago — "épico de construção não vai antes dos bloqueantes fechados"_

---

### EC-04 — Geração de User Stories

**CA #11**
Tela inicial apresenta todos os Jobs disponíveis como opções de ação — "Criar User Story", "Escrever PRD", "Planejar Roadmap", "Pesquisar Concorrentes" — porém apenas o fluxo de User Story está ativo e navegável na versão MVP. Os demais aparecem com indicação visual de "em breve", sem bloquear a experiência do usuário.
_Fonte: sugestão Babi (mentoria) — funil inicial para evitar "lero lero" + decisão de produto EC-04_

**CA #12**
Todas as USs geradas seguem rigorosamente o formato "Como [persona], quero [ação] para [benefício]" — formato fora do padrão é bloqueante antes de exibir ao PM.
_Fonte: decisão de produto — formato definido pelo time_

**CA #13**
Cada US gerada inclui pelo menos um critério de aceite específico e testável — nunca genérico como "funcionar corretamente".
_Fonte: aprendizado dos testes — issues vagos causam retrabalho com a engenharia_

**CA #14**
Restrições regulatórias identificadas no input (Bacen, MCR, LGPD, CDC) são incorporadas como critérios de aceite ou notas de conformidade nas USs relevantes — nunca ignoradas.
_Fonte: padrão dos testes EC-01 — restrições regulatórias foram o principal diferencial identificado_

**CA #15**
PM edita, adiciona e remove USs individualmente antes de aprovar. USs aprovadas enviadas ao Linear como issues individuais com o texto da história no título.
_Fonte: padrão de revisão inline dos EC-01 e EC-03_

**CA #16**
O agente responde de forma curta, direta e objetiva — sem introduções longas ou "lero lero" de brainstorming. Usa linguagem neutra (sem assumir identidade ou contexto do usuário) e entrega o output estruturado em no máximo 3 interações a partir do input inicial.
_Fonte: Babi (mentoria) — "responder como no WhatsApp, curto e direto; linguagem neutra por não saber a identidade do usuário"_

---

## 04 · Riscos e decisões pendentes

| Prioridade | Item | Detalhe |
|---|---|---|
| 🔴 Bloqueante | Arquitetura de dados | Definir on-premise vs. cloud privada antes do desenvolvimento. Banco digital não adota sem garantia de não-retenção. Aprovação de SI: 3–6 meses para esse segmento. |
| 🔴 Bloqueante | LGPD — dados sensíveis sem camada PII | MVP limitado a dados não-sensíveis até V2. Documentar explicitamente nos termos de uso do beta. |
| 🟡 Atenção | Cobertura regulatória do modelo | Risco de falso positivo/negativo em restrições Bacen/MCR/LGPD. Validar com compliance antes do beta. |
| ⚪ Backlog | Suporte a múltiplas ferramentas | 3 dos 5 testes pediram Jira além do Linear. MVP foca em Linear — arquitetura deve prever integração na V2. |

---

## 05 · Métricas de sucesso

**North Star Metric:** Nota bruta → issues no Linear ≤ 20 min (vs. 4–8h hoje)

| Métrica | Meta |
|---|---|
| PRDs aprovados sem edição significativa | ≥ 70% |
| Épicos enviados sem reestruturação | ≥ 60% |
| NPS de uso real | ≥ 8 |
| Issues de compliance em épico separado | 100% |
| USs aprovadas sem reescrita (EC-04) | ≥ 70% |
| Critério de go para beta | ≥ 3 empresas com uso recorrente/semana em 30 dias |

---

## 06 · Aprendizados dos testes incorporados

**✓ Diferencial vs. ChatGPT:**
Captura vocabulário regulatório (CPR, MCR, Bacen) sem treinamento — validado por Ana Clara e Marcos.

**✓ Maior valor em pressão de prazo:**
Thiago (NPS 10): capturou 4 bloqueantes jurídicos invisíveis. Posicionamento: "o PRD que te salva quando mais precisa".

**⚠ Tom assertivo em discovery:**
Julia identificou que o PRD parecia mais seguro do que o estágio real justifica. Ajustar prompts para reconhecer grau de certeza.

**⚠ Issue de analytics sempre faltou nos 5 testes:**
Adicionar como item sugerido padrão com opt-out.

**→ Caso de uso secundário emergente:**
Julia usou como "mentor silencioso" — oportunidade para onboarding de PMs Júnior na V3.
