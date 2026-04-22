

| PRODUCT REQUIREMENTS DOCUMENT AI Project Mentor MVP — Versão 1.0 |
| :---: |

| Segmento:  Instituições Financeiras — Cartões de Crédito Público-alvo:  Product Managers em início de carreira ou transição Versão do documento:  1.0 Status:  Em revisão |
| :---- |

| 1\. VISÃO GERAL DO PRODUTO |
| :---- |

## **1.1 Resumo Executivo**

O AI Project Mentor é um assistente inteligente conversacional destinado a Product Managers iniciantes em instituições financeiras — especialmente no segmento de cartões de crédito. O produto atua como um mentor sênior onipresente, combinando base de conhecimento proprietária sobre gestão de produtos, contexto organizacional e monitoramento regulatório em tempo real.

O MVP tem como objetivo validar três hipóteses centrais: (1) que a IA consegue reduzir o tempo de ciclo de elaboração de User Stories com conformidade regulatória, (2) que PMs iniciantes aderem a uma ferramenta de suporte conversacional integrada ao seu fluxo de trabalho e (3) que o produto gera percepção de ganho de autonomia intelectual — não apenas de velocidade operacional.

## **1.2 Problema-Raiz**

| *"A insegurança técnica e a falta de contexto sobre o ecossistema da empresa transformam o PM iniciante em um 'anotador de pedidos', gerando desperdício de recursos, retrabalho e riscos de conformidade por falta de visão sistêmica."* |
| :---- |

PMs em início de carreira em instituições financeiras enfrentam três falhas sistêmicas simultâneas:

* Lacuna de repertório técnico-regulatório: desconhecimento das normas do BCB e de como elas se aplicam a funcionalidades específicas do produto.

* Lacuna de contexto organizacional: falta de acesso estruturado a decisões históricas, políticas internas e OKRs da empresa.

* Lacuna de processo: ausência de um ritual de revisão antes de mover cards no Jira, resultando no ciclo 'escreve → volta da eng → reescreve' que desperdiça dias de trabalho.

## **1.3 How Might We**

| *Como podemos transformar o AI Project Mentor no mentor sênior onipresente que garante que nenhum PM de cartões entregue algo sem valor ou com risco regulatório?* |
| :---- |

## **1.4 Hipótese Central**

| Acreditamos que | O AI Product Mentor será capaz de conduzir, mentorar e orientar o PM iniciante, dando-lhe visão sistêmica do processo de produtização e de geração de valor, alinhado à cultura, ferramentas de agilidade e OKRs da empresa. |
| :---- | :---- |
| **Para verificar** | Criar um protótipo de chatbot conversacional alimentado com base de conhecimento sobre Gestão de Produtos e documentos específicos da empresa (contexto organizacional), integrado às ferramentas de agilidade. |
| **Mediremos** | % de engajamento/adoção do MVP, taxa de aceitação de ideias propostas (likes/dislikes) e NPS qualitativo com PMs e Gestores — complementados por métricas de resultado: taxa de cards reabertos e tempo médio de ciclo no Jira. |
| **Sucesso se** | O Mentor reduzir a curva de aprendizado de novos PMs, impactando positivamente a qualidade das entregas e o alcance dos indicadores — e se o PM sentir que ganhou autoridade intelectual, não apenas velocidade operacional. |

## **1.5 Público-Alvo**

Persona central: "Mari" — PM em início de carreira ou em transição de outra área, atuando em squads de crédito/cartões de uma instituição financeira regulada pelo BCB. Características definidoras:

* Alta pressão de entrega: deadlines de sprint \+ pressão de stakeholders de negócio.

* Baixo repertório regulatório: não domina as Resoluções BCB aplicáveis ao produto.

* Síndrome do Impostor: entrega cards, mas não tem certeza se estão corretos até que voltem da eng.

* Bloqueio de ferramental: trabalha em ambiente corporativo com restrições de TI para instalação de plugins.

* Aspiração de crescimento: quer ser reconhecida como PM estratégica, não apenas executora.

| 2\. OBJETIVOS E MÉTRICAS DE SUCESSO |
| :---- |

## **2.1 OKRs do MVP**

### **Objective 1 — Ativação**

Garantir que o PM experiencie valor real na primeira sessão, eliminando o abandono precoce.

| Métrica | Meta MVP | Critério de Sucesso |
| :---- | :---- | :---- |
| Taxa de conclusão da 1ª conversa | \> 60% | Usuário chega à primeira resposta de valor |
| Abandono no 1º acesso | \< 30% | Redução de 70% vs. chat em branco |
| Tempo até 1ª resposta de valor | \< 90 segundos | Medido via logs de sessão |

### **Objective 2 — Qualidade de Entrega**

Reduzir o retrabalho causado por User Stories inadequadas ou com risco de conformidade.

| Métrica | Meta MVP | Critério de Sucesso |
| :---- | :---- | :---- |
| Cards reabertos por critério de aceite | \- 30% vs. baseline | Medido via Jira (antes x depois) |
| Taxa de aceitação de respostas | \> 75% de thumbs up | Medido pelo sistema de feedback |
| Tempo médio de ciclo (Backlog → Done) | \- 20% | Medido via Jira em 60 dias |

### **Objective 3 — Retenção e Satisfação**

Construir o hábito de uso e validar percepção de valor antes de escalar.

| Métrica | Meta MVP | Critério de Sucesso |
| :---- | :---- | :---- |
| Retenção em 7 dias | \> 40% | Usuário retorna ao menos uma vez |
| NPS qualitativo | \> 8 / 10 | Survey pós-sessão com PMs e Gestores |
| Adoção ativa no período piloto | \> 60% dos convidados | Login \+ uso efetivo em 30 dias |

## **2.2 Métricas de Guardrail**

Métricas que não devem piorar com o lançamento do MVP:

* Falsos positivos do linter de compliance: \< 15% das alertas geradas (senão geram ruído e abandono das notificações).

* Latência média de resposta: \< 8 segundos (acima disso, o PM percebe como lento em contexto de pressão).

* Reclamações de respostas genéricas: \< 10% dos feedbacks negativos devem mencionar "muito genérico" ou "não se aplica ao meu contexto".

| 3\. FEATURES DO MVP |
| :---- |

## **Visão Geral — Roadmap de Prioridades**

| Feature | Prioridade | Sprint | Status |
| :---- | :---- | :---- | :---- |
| F1 — Onboarding Conversacional Guiado | P0 — Must Have | Sprint 1–2 | 🔵 Planejado |
| F2 — Gerador de User Story \+ Linter de Compliance | P0 — Must Have | Sprint 2–4 | 🔵 Planejado |
| F3 — Feedback por Resposta (Thumbs \+ Chips) | P0 — Must Have | Sprint 1 | 🔵 Planejado |
| F4 — Product Playbook (Base de Conhecimento) | P1 — Should Have | Sprint 3–5 | ⚪ Backlog |
| F5 — Modo Aprendiz vs. Especialista | P2 — Nice to Have | Pós-MVP | ⚪ Backlog |
| F6 — Monitoramento de Regulatory Drift | P2 — Nice to Have | Pós-MVP | ⚪ Backlog |

| F1 — ONBOARDING CONVERSACIONAL GUIADO *first-run → primeira conversa completa  |  Prioridade: P0* |
| :---- |

### **Descrição**

O PM não pode abrir um chat em branco — essa é a principal causa de abandono na ativação. O onboarding realiza 3 perguntas contextuais (squad, tipo de funcionalidade, dor do momento) e entrega a primeira resposta de valor em menos de 90 segundos. O momento-UAU precisa acontecer no primeiro acesso porque não existe segundo acesso se o primeiro falhar.

### **User Stories**

* Como PM iniciante, quero ser guiado por perguntas contextuais ao abrir o mentor pela primeira vez, para não enfrentar um campo em branco que aumente minha ansiedade.

* Como PM, quero receber uma resposta de valor em menos de 90 segundos após responder as perguntas de onboarding, para validar que a ferramenta entende meu contexto.

* Como PM, quero poder revisitar o onboarding sempre que mudar de squad ou tipo de funcionalidade, para recalibrar o contexto do mentor.

### **Critérios de Aceite**

* O fluxo de onboarding apresenta exatamente 3 perguntas contextuais em sequência (sem formulário longo).

* A primeira resposta de valor é entregue em até 90 segundos após a última pergunta de onboarding.

* O fluxo é acessível via web (sem necessidade de plugin), compatível com Chrome, Edge e Safari.

* O contexto capturado no onboarding persiste na sessão e influencia as respostas subsequentes.

* O sistema permite recomeçar o onboarding a qualquer momento via botão visível na interface.

### **Impacto Esperado**

* \> 60% de conclusão da 1ª conversa completa.

* ↓ 70% de abandono no 1º acesso vs. chat em branco.

* NPS da 1ª sessão \> 8\.

| F2 — GERADOR DE USER STORY \+ LINTER DE COMPLIANCE *escreva → revise → entregue sem volta da eng  |  Prioridade: P0* |
| :---- |

### **Descrição**

PM descreve a funcionalidade em linguagem natural via chat. O mentor devolve User Story completa (Como… Quero… Para que…) com critérios de aceite detalhados e um bloco de Riscos Regulatórios por cor: verde / âmbar / vermelho. É a feature que resolve o Ping-Pong do Jira e é a única diretamente ligada à métrica mais difícil de falsificar: cards reabertos.

### **User Stories**

* Como PM, quero descrever uma funcionalidade em linguagem natural e receber uma User Story estruturada (Como/Quero/Para que) com critérios de aceite, para não começar do zero toda vez.

* Como PM, quero que o mentor identifique riscos regulatórios no meu card com nível de severidade (verde/âmbar/vermelho), para saber o que precisa ser revisto antes do refinamento.

* Como PM, quero que alertas vermelhos exibam no máximo 2 blocos críticos por documento, para evitar ruído visual que me faça ignorar os alertas.

* Como PM, quero usar o linter via editor web standalone (sem plugin), para não depender de aprovação de TI da empresa.

### **Critérios de Aceite**

* O sistema gera User Story no formato (Como \[persona\] / Quero \[ação\] / Para que \[benefício\]) a partir de descrição em linguagem natural.

* O bloco de Riscos Regulatórios exibe no máximo 2 alertas críticos (vermelho) por documento.

* Cada alerta inclui: descrição do risco, normativo de referência e sugestão de correção.

* O editor web standalone funciona sem instalação de plugin — acesso via URL direta.

* O sistema reage ao thumbs down na mesma sessão, refinando a User Story com base no feedback imediato.

* O linter limita falsos positivos a menos de 15% das alertas geradas.

### **Impacto Esperado**

* \- 30% de cards reabertos por critério de aceite falho (meta direta, medida no Jira).

* \> 75% de aceitação de respostas geradas.

* Retenção ativa em 7 dias — o Tech Lead que elogia o refinamento é o gatilho de retenção.

| *"Quando o Tech Lead elogia meu refinamento, isso muda minha semana inteira. Preciso que essa feature me dê esse elogio uma vez — depois nunca mais largo o produto."* |
| :---- |

| F3 — FEEDBACK POR RESPOSTA (THUMBS \+ CHIPS DE RAZÃO) *qualidade percebida → dado acionável  |  Prioridade: P0* |
| :---- |

### **Descrição**

Sem esta feature, a métrica de aceitação simplesmente não existe para ser medida. Além de gerar o dado, o feedback sinaliza onde o modelo está errando sem precisar de entrevista qualitativa cara. Chips de razão pré-definidos evitam o loop de respostas genéricas. Detalhe crítico: o mentor deve reagir ao thumbs down na mesma sessão — feedback sem consequência visível é pior que não ter feedback.

### **User Stories**

* Como PM, quero avaliar cada resposta com thumbs up/down, para contribuir com a melhoria do modelo sem precisar de entrevista formal.

* Como PM, ao dar thumbs down, quero selecionar um chip de razão ("Muito genérico", "Não se aplica ao meu contexto", "Faltou detalhe regulatório", "Informação incorreta"), para dar feedback acionável sem digitar um parágrafo.

* Como PM, quero que o mentor refine a resposta imediatamente após o thumbs down, para sentir que o feedback teve consequência visível na mesma sessão.

### **Critérios de Aceite**

* Cada resposta do mentor exibe thumbs up e thumbs down, acessíveis por clique ou toque.

* Ao selecionar thumbs down, o sistema exibe até 4 chips de razão predefinidos.

* Após seleção do chip, o mentor gera uma nova versão da resposta na mesma sessão em até 15 segundos.

* Todos os feedbacks são registrados com: ID da sessão, resposta original, chip selecionado e timestamp.

* Painel de analytics interno exibe volume de feedbacks por chip por semana (para o time de produto).

### **Impacto Esperado**

* 75%+ de taxa de aceitação — a única forma de medir essa métrica no MVP.

* Loop de melhoria do modelo a cada sprint, guiado por dados e não por suposições.

* Redução de abandono por frustração com respostas genéricas.

| 4\. REQUISITOS NÃO FUNCIONAIS |
| :---- |

## **4.1 Desempenho**

| Requisito | Critério |
| :---- | :---- |
| Latência de resposta do mentor | \< 8 segundos (P95) |
| Disponibilidade do serviço | \> 99% em horário comercial (8h–20h) |
| Tempo de carregamento inicial | \< 3 segundos em conexão 4G |
| Capacidade de usuários simultâneos | \> 200 sessões no piloto |

## **4.2 Segurança e Conformidade**

* Toda informação sensível de backlog e User Stories transmitida pelo PM deve ser criptografada em trânsito (TLS 1.3) e em repouso (AES-256).

* O produto não deve armazenar dados regulatórios sensíveis fora do ambiente on-premise da empresa ou do cloud homologado.

* Logs de auditoria de acesso devem ser mantidos por no mínimo 12 meses.

* Conformidade com LGPD: dados de uso do PM devem ser anonimizados após 90 dias.

## **4.3 Usabilidade e Acessibilidade**

* A interface deve ser responsiva e funcionar em browsers corporativos padrão (Chrome 110+, Edge 110+, Safari 16+) sem instalação de plugin.

* O produto deve funcionar em desktop e mobile (tablet incluído).

* Atender às diretrizes WCAG 2.1 nível AA para acessibilidade.

* Toda resposta do mentor deve ter no máximo 400 palavras por bloco para evitar sobrecarga cognitiva.

## **4.4 Rastreabilidade e Transparência**

* Cada resposta do mentor deve exibir o grau de confiança da informação: "validado pelo Jurídico em \[data\]" vs. "interpretação baseada no normativo, não revisada pelo Compliance".

* O PM deve poder ver a fonte de cada afirmação regulatória (link para o normativo ou para o item do Playbook).

* Respostas geradas por IA devem ser identificadas com label visível.

| 5\. FORA DE ESCOPO DO MVP |
| :---- |

## **O que NÃO está no MVP**

Os itens abaixo foram identificados como valiosos pela pesquisa com usuários, mas foram deliberadamente excluídos do MVP para garantir foco na validação da hipótese central:

| Feature | Razão de Exclusão | Quando Entra |
| :---- | :---- | :---- |
| Plugin para Notion/Confluence | Processo de homologação de TI demora 4 meses em empresas do segmento | Pós-MVP, v1.1 |
| Notificação automática ao Compliance | Risco político: PM precisa ser avisada antes de qualquer escalada | Pós-MVP, com feature de aprovação pelo PM |
| Análise multimodal de wireframes/mockups | Alto risco de falso positivo; requer maturidade do modelo | Pós-MVP, v2.0 |
| Monitoramento de Regulatory Drift | Depende do Product Playbook (F4) estar maduro e validado | Pós-MVP, v1.2 |
| Modo Aprendiz vs. Especialista | Requer dados de uso para calibrar a curva de progressão | Pós-MVP, v1.2 |
| Painel de Saúde do Playbook (semáforo) | Depende de F4 e de processo de curadoria estabelecido | Pós-MVP, v1.1 |

| 6\. RISCOS E MITIGAÇÕES |
| :---- |

| Risco | Probabilidade | Impacto | Mitigação |
| :---- | :---- | :---- | :---- |
| Playbook desatualizado (lag regulatório) | Alta | Crítico | Exibir grau de confiança em cada resposta; alerta visual para normativos com \> 30 dias sem revisão. |
| Ruído de alertas (falsos positivos do linter) | Média | Alto | Limite de 2 alertas críticos por documento; threshold de \< 15% de falsos positivos antes do lançamento. |
| Dependência de plugin bloqueado por TI | Alta | Alto | MVP entregue como editor web standalone — sem plugin necessário. |
| PM vira 'usuária de template' sem aprendizado | Média | Médio | Campo '?' expansível em cada critério explicando a lógica de negócio; planejamento do Modo Aprendiz para pós-MVP. |
| Abandono por resposta genérica | Média | Alto | Chips de razão \+ refinamento imediato pós-thumbs down; monitoramento semanal do % de chip 'Muito genérico'. |
| Problemas de latência em pico de uso | Baixa | Médio | SLA de \< 8s (P95); monitoramento de capacidade; fila de priorização por sessão ativa. |

| 7\. PLANO DE LANÇAMENTO DO MVP |
| :---- |

## **7.1 Fases**

| Fase | Período | Objetivo |
| :---- | :---- | :---- |
| Fase 0 — Preparação | Semanas 1–2 | Setup de infraestrutura, definição de base de conhecimento inicial, onboarding do time de produto. |
| Fase 1 — Alpha Fechado | Semanas 3–6 | 5–10 PMs selecionados. Validar onboarding (F1) e feedback (F3). Iterar antes de expandir. |
| Fase 2 — Beta Piloto | Semanas 7–12 | 20–50 PMs em 2–3 squads. Lançar Gerador de User Story \+ Linter (F2). Medir métricas de guardrail. |
| Fase 3 — Avaliação MVP | Semana 13 | Revisão completa das métricas. Decisão: escalar, iterar ou pivotar. |

## **7.2 Critérios de Go/No-Go para Escala**

Antes de expandir o produto para além do piloto, os seguintes critérios devem ser atingidos:

* Taxa de conclusão da 1ª conversa \> 60% (F1).

* Taxa de aceitação de respostas \> 75% (F3).

* Pelo menos 1 evidência qualitativa de redução de cards reabertos documentada pelo Tech Lead do squad piloto.

* NPS qualitativo \> 8 com PMs e Gestores do piloto.

* Falsos positivos do linter \< 15% das alertas geradas.

## **7.3 Governança do Produto**

* Owner do PRD: Product Manager responsável pela squad de IA Interna.

* Revisão de métricas: semanal durante o piloto (Fase 1 e 2).

* Curadoria do Playbook: processo formal a ser definido antes da Fase 2 — jamais delegado a PMs juniores sem revisão sênior.

* Compliance Review: toda atualização na base de conhecimento regulatória deve passar por revisão do time de Jurídico/Compliance antes de ativação.

## **Carta do Usuário**

| *"Se vocês querem que eu use esse produto de verdade — não só nos primeiros 15 dias de novidade — o que eu realmente preciso é me sentir mais inteligente depois de usar, não apenas mais rápida. Eu preciso chegar numa reunião com o Diretor e saber, com convicção, por que uma decisão é a certa — não só que o bot disse que estava ok. Não quero mais ser uma coladora de cacos. Quero ser a PM que chega com os cacos já colados, entendendo cada peça, e que ainda sabe contar por que o vaso ficou mais bonito assim."* |
| :---- |

— Mari Castro, PM — Pesquisa de Usuário, AI Project Mentor

*— Fim do Documento —*