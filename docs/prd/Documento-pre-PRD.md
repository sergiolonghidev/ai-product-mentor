### **📋 DESAFIO DE DESIGN**

**Projeto:** AI Project Mentor

**🎯 How Might We:**

Como podemos transformar o "AI Project Mentor" no mentor sênior onipresente que garante que nenhum PM de cartões entregue algo sem valor ou com risco regulatório?

**🧪 Hypothesis Card:**

* **Nós acreditamos que:** O AI Product Mentor será capaz de conduzir, mentorar e orientar o PM iniciante, dando a este uma visão sistêmica do processo de produtização e de geração de valor, alinhado à cultura, ferramentas de agilidade e OKRs da empresa.  
* **Para verificar, vamos:** Criar um protótipo de chatbot conversacional alimentado com base de conhecimento sobre Gestão de Produtos e documentos específicos da empresa (contexto organizacional), integrado às ferramentas de agilidade.  
* **E mediremos:** % de engajamento/adoção do MVP, taxa de aceitação de ideias propostas (likes/dislikes) e NPS qualitativo com PMs e Gestores.  
* **Teremos sucesso se:** O Mentor conseguir reduzir a curva de aprendizado de novos PMs, impactando positivamente a qualidade de suas entregas e o alcance de seus indicadores.

**👥 Público-alvo central:**

Product Managers em início de carreira ou transição que atuam em instituições financeiras (segmento de cartões de crédito), lidando com alta pressão regulatória e falta de repertório técnico/organizacional.

**🔑 Problema-raiz identificado:**

A insegurança técnica e a falta de contexto sobre o ecossistema da empresa transformam o PM iniciante em um "anotador de pedidos", gerando desperdício de recursos, retrabalho e riscos de conformidade por falta de visão sistêmica.

---

# **Reações da Mari Castro — AI Product Mentor 🎯**

---

## **Insight 1: O "Product Playbook" como Base do Conhecimento**

**Relevância declarada: 10/10**

### **1\. REAÇÃO GERAL: 👍**

### **2\. O Que Funciona pra Mim**

Cara, isso é exatamente o "Google da empresa com o cérebro do meu Diretor" que eu sempre falei que precisava. Quando o BCB mudou as regras de pagamento mínimo no ano passado, eu fiquei sabendo por um colega no café — isso é inadmissível num squad de Credit Cards. A ideia de um repositório que *automaticamente* traduz normativo em regra de negócio aplicável ao PRD é o sonho que eu nem sabia que podia sonhar.

### **3\. O Que Me Preocupa**

Meu medo real é: *quem alimenta esse Playbook?* Porque se for eu ou outro PM Junior que vai "codificar o conhecimento sênior", a gente vai reproduzir exatamente os gaps que já temos. E a velocidade de ingestão me preocupa — o BCB não manda aviso prévio, e se o mentor tiver um lag de 48h numa circular crítica, eu posso subir um card problemático nesse intervalo.

### **4\. O Que Eu Sugeriria**

Precisa ter um "grau de confiança" explícito em cada resposta — tipo, o mentor dizer "essa regra está no Playbook validado pelo Jurídico em 15/03/2025" vs. "essa é uma interpretação baseada no normativo, não foi revisada pelo Compliance ainda". Sem essa transparência, eu não consigo saber quando posso usar a resposta numa reunião com Diretor e quando preciso checar antes. Também quero poder ver *de onde veio* aquela informação, não só a resposta pronta.

### **5\. Ideia Que Vem À Mente**

Um **"Painel de Saúde do Playbook"** — uma tela simples que mostra quando cada norma foi atualizada pela última vez, quem validou, e um semáforo de confiança (verde \= validado pelo Jurídico, amarelo \= pendente de revisão, vermelho \= normativo novo, ainda não digerido). Isso me daria segurança para *citar* o mentor em reuniões de stakeholders sem medo de dar uma mancada na frente do GPM.

---

## **Insight 2: Shift-Left de Conformidade no Editor de Documentos**

**Relevância declarada: 9.5/10**

### **1\. REAÇÃO GERAL: 👍 (com ressalvas técnicas)**

### **2\. O Que Funciona pra Mim**

O "linter de conformidade" em tempo real enquanto escrevo a User Story é a coisa que eu mais precisava e não sabia nomear. Hoje meu processo é: escrevo, subo pro Jira, o Tech Lead lê, manda de volta, eu corro pro Slack perguntar pro colega "gente fina", reescrevo, subo de novo. É 3 dias perdidos facilmente. Se isso acontecesse *enquanto eu digito no Notion*, eu economizaria minha semana toda.

### **3\. O Que Me Preocupa**

Plugin para Notion é ótimo, mas a minha empresa usa uma versão corporativa do Confluence que o time de TI trava qualquer extensão que não passa pelo processo de homologação — que demora em média 4 meses. Se o produto só funcionar como plugin de browser ou extensão, eu posso amar a ideia e nunca conseguir usar no trabalho. Além disso, destaque em "amarelo e vermelho" sem contexto vira ruído — se cada parágrafo ficar grifado, eu vou começar a ignorar igual ignoro os alerts do Gmail.

### **4\. O Que Eu Sugeriria**

Precisa ter uma versão web standalone — um editor próprio onde eu colo minha história e o linter roda ali, sem depender de plugin aprovado pelo TI. E o sistema de alertas precisa de uma hierarquia clara: no máximo 2 blocos críticos por documento (vermelho \= para tudo), senão vira ansiedade visual. Sugiro também um modo "revisão pré-refinamento" — botão que eu aperto antes de subir o card, que faz uma varredura final e gera um relatório de 5 linhas tipo "3 riscos encontrados, 1 crítico".

### **5\. Ideia Que Vem À Mente**

Um **"Pré-Refinamento Automático"** — antes de mover qualquer card de Backlog para In Refinement no Jira, o mentor dispara automaticamente uma checagem e bloqueia a transição de status se houver risco vermelho não resolvido. Isso me protege de mim mesma nos dias de sexta às 17h quando eu tô correndo para fechar sprint. O Tech Lead veria que o card passou pelo crivo do mentor, o que ia aumentar muito minha credibilidade com o time de dev.

---

## **Insight 3: Treinamento por "Scaffolding" e Redução de Carga Cognitiva**

**Relevância declarada: 9/10**

### **1\. REAÇÃO GERAL: 🤔**

### **2\. O Que Funciona pra Mim**

A analogia com diagnóstico diferencial da medicina me pegou — é exatamente assim que eu penso quando trava: "existe algum framework pra isso ou eu tô reinventando a roda?". Templates com checklists de compliance *embutidos por tipo de funcionalidade* (fatura, parcelamento, recompensa) resolve minha Paralisia da Sigla na prática. Não precisar lembrar de todas as resoluções do BCB, mas ter elas aparecendo no contexto da minha tarefa específica — isso sim é redução de carga cognitiva de verdade.

### **3\. O Que Me Preocupa**

Meu risco aqui é virar uma "PM de template" — alguém que só preenche campos sem entender o porquê. Se eu usar scaffolding para tudo, daqui a 2 anos ainda vou ter a Síndrome do Impostor porque nunca *aprendi*, só *executei*. Eu preciso que o mentor me ensine enquanto me ajuda, não que ele simplesmente faça por mim. Template sem contexto educativo é uma muleta, não um mentor.

### **4\. O Que Eu Sugeriria**

Cada campo do template precisa ter um "?" expansível que explica *por que* aquele critério existe — não a lei em si, mas a lógica de negócio por trás. Tipo: "Por que preciso informar o CET nesse momento do fluxo? Porque o BCB entende que o usuário precisa de X oportunidades de desistência antes do Y." Isso me treina enquanto eu entrego. Com o tempo, eu internalizo e o template vira opcional.

### **5\. Ideia Que Vem À Mente**

Um **"Modo Aprendiz vs. Modo Especialista"** — no Modo Aprendiz (que seria meu modo atual), o mentor preenche o template comigo e explica cada seção em linguagem humana. No Modo Especialista, ele só alerta quando tem desvio, sem segurar minha mão. Eu poderia setar meu modo por *tipo de funcionalidade* — ainda sou aprendiz em tokenização, mas já sou especialista em fatura. Isso me daria uma progressão visível, que é exatamente o tipo de coisa que eu colocaria no meu LinkedIn.

---

## **Insight 4: Monitoramento Ativo de "Regulatory Drift"**

**Relevância declarada: 8.5/10**

### **1\. REAÇÃO GERAL: 👍**

### **2\. O Que Funciona pra Mim**

O "Erro de 1 Milhão de Reais" que me assombra toda semana tem um nome agora: Regulatory Drift. A ideia de um agente que varre meu backlog do Jira toda vez que sai uma circular nova e me notifica "esses 3 cards foram afetados" é o tipo de coisa que me faria dormir melhor. Hoje eu não tenho nenhum processo estruturado pra isso — dependo de alguém do Compliance mandar um e-mail que às vezes chega, às vezes não chega.

### **3\. O Que Me Preocupa**

A notificação automática para o stakeholder de Compliance me deixa nervosa. Se o sistema avisar o Compliance que *meu* backlog tem um item fora de conformidade antes de eu ter a chance de ajustar, eu posso criar um problema político desnecessário. Eu preciso ser avisada *primeiro*, com tempo para resolver ou contextualizar, antes de qualquer notificação ir para cima. Também me preocupa falso positivo — se o agente me mandar 15 alertas por semana sobre drift "potencial", eu vou desligar as notificações em 2 semanas.

### **4\. O Que Eu Sugeriria**

Quero um fluxo em dois tempos: primeiro, notificação privada para mim com prazo de 48h para triagem ("isso afeta ou não o meu contexto?"). Só depois, se eu confirmar o impacto, o sistema escalona para Compliance com o meu contexto já incluído. Isso preserva minha autoridade sobre o produto e evita que eu pareça descuidada. E o agente precisa me dizer o *impacto estimado* — "essa mudança afeta critério de aceite, não afeta regra de negócio core", não só "houve um drift".

### **5\. Ideia Que Vem À Mente**

Um **"Diário de Bordo Regulatório"** por produto — uma timeline de todas as alterações normativas que impactaram meu squad nos últimos 12 meses, com o status de cada uma (resolvido, em tratativa, ignorado com justificativa). Isso seria ouro em duas situações: quando um Diretor me pergunta "como estamos em relação à última circular?" eu tenho uma resposta em 30 segundos; e quando onboard um PM novo no squad, eu tenho um histórico de decisões que foi tomado e por quê.

---

## **Insight 5: Perspectiva Multimodal para Experiência do Usuário**

**Relevância declarada: 8/10**

### **1\. REAÇÃO GERAL: 🤔**

### **2\. O Que Funciona pra Mim**

A tensão entre conformidade e usabilidade é real e ninguém fala sobre isso abertamente. Já vi produto de cartão que cumpre 100% do BCB e é tão "clunky" que o usuário abandona o fluxo antes de contratar. A ideia de analisar o mockup e verificar se o CET está visível *e* se a UX está fluida ao mesmo tempo resolve uma dor que hoje eu resolvo em reuniões separadas: uma com o Compliance, outra com o Designer.

### **3\. O Que Me Preocupa**

Análise de wireframe por IA soa incrível em demo, mas minha dúvida é: ela entende o *contexto* do wireframe? Um CET pode estar tecnicamente visível mas posicionado num momento do fluxo em que o usuário já está cognitivamente sobrecarregado — isso requer julgamento humano e entendimento de jornada que não sei se um modelo consegue capturar bem. Se a IA me der um "aprovado" e o Compliance reprovar depois, perco credibilidade duas vezes.

### **4\. O Que Eu Sugeriria**

Esse insight funcionaria melhor como uma "segunda opinião" do que como um "parecer definitivo". O mentor analisa o mockup e me dá 3 perguntas que *eu* preciso responder antes de submeter para aprovação — tipo um "advogado do diabo" visual. Isso me treina a pensar em conformidade de UX sem criar a falsa sensação de que a IA aprovou o design. A responsabilidade final precisa ficar comigo.

### **5\. Ideia Que Vem À Mente**

Um **"Checklist de Revisão Visual Guiada"** — eu uplo o mockup, a IA destaca os elementos obrigatórios (CET, taxa, data de vencimento) e me faz perguntas como: "Em qual etapa do fluxo esse elemento aparece? O usuário já tomou a decisão de contratar antes ou depois desse ponto?" Isso transforma a análise multimodal numa conversa socrática que me ensina a pensar em conformidade visual, ao invés de terceirizar o julgamento para a IA.

---

---

# **SÍNTESE FINAL**

## **a) Ranking dos Insights — do mais ao menos relevante pra mim**

| \# | Insight | Por quê |
| ----- | ----- | ----- |
| 🥇 1º | **Shift-Left de Conformidade (Insight 2\)** | Resolve meu problema *hoje*, no ato de escrever. É onde eu mais sangro. |
| 🥈 2º | **Product Playbook (Insight 1\)** | Base de tudo — sem isso, os outros insights são construídos sobre areia. |
| 🥉 3º | **Regulatory Drift (Insight 4\)** | Me protege do meu maior medo existencial. Mas depende do Insight 1 funcionar bem. |
| 4º | **Scaffolding (Insight 3\)** | Muito valioso, mas só se tiver o componente educativo. Sem ele, vira muleta. |
| 5º | **Multimodal / UX (Insight 5\)** | O mais inovador, mas o que eu adotaria por último — risco de falso positivo alto demais ainda. |

---

## **b) A hipótese do projeto me convence?**

**Parcialmente, e vou ser honesta sobre o porquê.**

A hipótese me convence no *diagnóstico* — sim, o problema é real, eu sou o público-alvo, e a curva de aprendizado de PM junior em cartões é brutal. Mas ela me preocupa na *métrica de sucesso*. "% de engajamento" e "likes/dislikes" medem uso, não transformação. Um PM pode abrir o mentor todo dia e continuar entregando cards ruins. O que eu mediria é: **taxa de cards que voltam da engenharia por critério de aceite falho** (antes vs. depois) e **tempo médio de ciclo de uma história do backlog ao Done**. Esses números aparecem no Jira e são os que meu GPM acompanha de verdade.

Para a hipótese ficar mais forte, eu adicionaria: *"Teremos sucesso se o PM sentir que ganhou autoridade intelectual, não apenas velocidade operacional."* Porque se o produto me fizer mais rápida mas ainda me deixar com Síndrome do Impostor, eu abandonei minha aspiração de ser PM Sênior estratégica — apenas me tornei uma PM Junior mais eficiente. Esses são objetivos completamente diferentes.

---

## **c) Carta Aberta**

"Se vocês querem que eu use esse produto de verdade — não só nos primeiros 15 dias de novidade — o que eu realmente preciso é me sentir mais inteligente depois de usar, não apenas mais rápida. Eu preciso chegar numa reunião com o Diretor e saber, com convicção, por que uma decisão é a certa — não só que o bot disse que estava ok. Preciso de um mentor que me ensine enquanto me salva, que cite de onde veio cada resposta, que entenda que 'contexto da empresa' não é um detalhe, é tudo. E, acima de tudo, preciso que ele me proteja de mim mesma nos momentos de pressão — quando o stakeholder está me pedindo algo fora do OKR e eu não sei dizer não, quando é sexta às 17h e eu to subindo um card sem ter dormido direito. Não quero mais ser uma coladora de cacos. Quero ser a PM que chega com os cacos já colados, entendendo cada peça, e que ainda sabe contar por que o vaso ficou mais bonito assim."

## **As 3 features criticas para o MVP**

## 

## **01\. Onboarding Conversacional Guiado**

**Tagline:** *first-run → primeira conversa completa*

### **Métricas de Sucesso**

* **Adoção:** \>60%  
* **Retenção 7d:** \>40%  
* **NPS:** \>8

### **Descrição**

O PM não pode abrir um chat em branco — esse é o maior killer de ativação. O onboarding faz 3 perguntas de contexto (squad, tipo de funcionalidade, dor do momento) e entrega a primeira resposta de valor em menos de 90 segundos. O "momento uau" precisa acontecer no primeiro acesso, porque não existe segundo acesso se o primeiro falhar.

**Voz da Mari:** "Se eu abrir e tiver um campo em branco, eu vou fechar. Eu já tenho ansiedade suficiente sem precisar de *mais uma caixa vazia me olhando*."

### **Impacto**

* **\>60%** de conclusão da 1ª conversa.  
* **↓70%** de abandono no 1º acesso.  
* `#3 Scaffolding`

---

## **02\. Gerador de User Story \+ Linter de Compliance**

**Tagline:** *escreva → revise → entregue sem volta da eng*

### **Métricas de Sucesso**

* **Cards reabertos:** \-30%  
* **Aceitação:** \>75%  
* **Retenção 7d:** Ativa

### **Descrição**

PM descreve a funcionalidade em linguagem natural. O mentor devolve User Story completa (Como… Quero… Para que…) com critérios de aceite detalhados e um bloco de "Riscos Regulatórios" por cor: verde / âmbar / vermelho. É a feature que resolve o Ping-Pong do Jira e é a única ligada à métrica mais difícil de falsificar: cards reabertos.

**Voz da Mari:** "Quando o Tech Lead *elogia meu refinamento*, isso muda minha semana inteira. Preciso que essa feature me dê esse elogio uma vez — depois nunca mais largo o produto."

### **Impacto**

* **\-30%** de cards reabertos (meta direta).  
* **\+75%** de aceitação de respostas.  
* `#2 Shift-Left`

---

## **03\. Feedback por Resposta — Thumbs \+ Razão em Chips**

**Tagline:** *qualidade percebida → dado acionável*

### **Métricas de Sucesso**

* **Aceitação:** \>75%  
* **NPS:** \>8

### **Descrição**

Sem essa feature, a métrica de aceitação simplesmente não existe para ser medida. Além de gerar o dado, o feedback sinaliza onde o modelo está errando sem precisar de entrevista. Chips de razão ("Muito genérico", "Não se aplica ao meu contexto", "Faltou detalhe regulatório") evitam o loop de respostas genéricas. **Detalhe crítico:** o mentor deve reagir ao thumbs down na mesma sessão — feedback sem consequência visível é pior que não ter.

**O que a Mari nos avisou:** "Se a IA me der uma resposta genérica de livro-texto que não se aplica ao contexto específico da minha empresa, *eu desisto na hora*."

### **Impacto**

* **75%+** métrica mensurável.  
* **Sprint:** loop de melhoria a cada ciclo.  
* `#1 Playbook`

---

