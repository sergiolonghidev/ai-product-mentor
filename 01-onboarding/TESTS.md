# TESTS.md — F1: Onboarding Conversacional Guiado

---

## Critérios de Aceite (verificáveis)

### CA-01: Wizard de 3 perguntas
- [ ] As perguntas são exibidas **uma por vez**, nunca todas simultaneamente
- [ ] Existe indicador de progresso (ex: "Passo 1 de 3")
- [ ] O botão "Próxima" está **desabilitado** com o campo vazio
- [ ] O botão "Próxima" fica **ativo** assim que o campo é preenchido

### CA-02: Navegação
- [ ] O botão "Voltar" aparece a partir da Pergunta 2
- [ ] Ao voltar, a resposta anterior está **preservada** no campo
- [ ] O botão "Voltar" **não aparece** na Pergunta 1

### CA-03: Seleção de tipo de funcionalidade (Pergunta 2)
- [ ] Exibe exatamente 7 chips (incluindo "Outro")
- [ ] Apenas **1 chip** pode ser selecionado por vez
- [ ] Ao selecionar um chip, o botão "Próxima" fica **imediatamente** ativo (sem precisar clicar em outro lugar)

### CA-04: Mensagem de boas-vindas
- [ ] Aparece em **stream** — texto vai sendo exibido progressivamente
- [ ] Menciona o **squad** informado pelo PM
- [ ] Menciona o **tipo de funcionalidade** selecionado
- [ ] Termina com uma **pergunta aberta**
- [ ] Tem no máximo **3 parágrafos**
- [ ] O botão "Começar a trabalhar" aparece somente **após o streaming completar**

### CA-05: Tempo
- [ ] O fluxo completo (3 perguntas + boas-vindas) ocorre em **menos de 90 segundos** para inputs normais
- [ ] O estado de loading (spinner) aparece enquanto aguarda a resposta da LLM

### CA-06: Compatibilidade
- [ ] Funciona em **Chrome 110+**
- [ ] Funciona em **Edge 110+**
- [ ] Funciona em **Safari 16+**
- [ ] Funciona em **mobile** (viewport 375px+)

### CA-07: Persistência de sessão
- [ ] Após o onboarding, o `sessionId` é armazenado e usado em todas as requisições seguintes
- [ ] Se o PM fechar o browser **antes** de completar o onboarding, ao voltar recomeça do início

---

## Casos de Teste

### CT-01: Fluxo feliz completo
```
DADO que o PM acessa /onboarding pela primeira vez
QUANDO preenche "Credit Cards — Aquisição" na Pergunta 1
E seleciona "Parcelamento" na Pergunta 2
E digita "Não sei quais critérios de compliance incluir na user story de parcelamento" na Pergunta 3
E clica em "Próxima" após cada pergunta
ENTÃO deve ver a mensagem de boas-vindas em stream
E a mensagem deve mencionar "Aquisição" ou "squad"
E a mensagem deve mencionar "parcelamento"
E deve haver um botão "Começar a trabalhar" ao final
```

### CT-02: Botão inativo sem preenchimento
```
DADO que o PM está na Pergunta 1
QUANDO o campo de squad está vazio
ENTÃO o botão "Próxima" está desabilitado
QUANDO digita pelo menos 1 caractere
ENTÃO o botão "Próxima" fica ativo
```

### CT-03: Navegação para trás preserva resposta
```
DADO que o PM está na Pergunta 2 e selecionou "Fatura"
QUANDO clica em "Voltar"
ENTÃO está na Pergunta 1
QUANDO clica em "Próxima"
ENTÃO está na Pergunta 2
E o chip "Fatura" ainda está selecionado
```

### CT-04: Erro de LLM
```
DADO que a API da Anthropic está indisponível
QUANDO o PM conclui as 3 perguntas
ENTÃO vê uma mensagem de erro amigável (não stack trace)
E vê um botão "Tentar novamente"
QUANDO clica em "Tentar novamente"
ENTÃO faz nova tentativa com os mesmos dados (não perde as respostas)
```

### CT-05: Seleção de chip muda a seleção anterior
```
DADO que o PM selecionou "Fatura"
QUANDO clica em "Parcelamento"
ENTÃO "Parcelamento" fica selecionado
E "Fatura" fica desmarcado
```

---

## Testes Unitários (API)

### `POST /api/session/start`

```typescript
describe('POST /api/session/start', () => {
  it('retorna 201 com session e welcomeMessage para input válido', async () => {
    const res = await POST({ context: validContext })
    expect(res.status).toBe(201)
    expect(res.body.session.id).toBeDefined()
    expect(res.body.session.status).toBe('active')
    expect(res.body.welcomeMessage.content).toBeTruthy()
  })

  it('retorna 400 para squad vazio', async () => {
    const res = await POST({ context: { ...validContext, squad: '' } })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 para functionalityType inválido', async () => {
    const res = await POST({ context: { ...validContext, functionalityType: 'invalido' } })
    expect(res.status).toBe(400)
  })

  it('retorna 503 quando LLM está indisponível', async () => {
    mockLLM.mockRejectedValue(new Error('timeout'))
    const res = await POST({ context: validContext })
    expect(res.status).toBe(503)
    expect(res.body.error.code).toBe('LLM_UNAVAILABLE')
  })
})
```

---

## Métricas de Validação no Piloto

| Métrica | Meta | Como medir |
|---------|------|-----------|
| Taxa de conclusão do onboarding | > 60% | sessões com status = 'active' / sessões iniciadas |
| Tempo médio até 1ª resposta | < 90s | `session.createdAt` → `welcomeMessage.createdAt` |
| Abandono na Pergunta 1 | < 20% | sessões sem nenhuma resposta registrada |
| Abandono na Pergunta 2 | < 15% | sessões com apenas 1 resposta |
| Abandono na Pergunta 3 | < 10% | sessões com apenas 2 respostas |
