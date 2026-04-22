# TESTS.md — F3: Feedback por Resposta

---

## Critérios de Aceite

### CA-01: Thumbs Up
- [ ] Botão 👍 aparece em **toda** resposta do mentor
- [ ] Ao clicar, o ícone muda para estado "ativo" (preenchido)
- [ ] O feedback é salvo **sem necessidade de confirmação adicional**
- [ ] O botão fica **desabilitado** após o voto (não pode mudar)

### CA-02: Thumbs Down
- [ ] Botão 👎 aparece em toda resposta do mentor
- [ ] Ao clicar, os **4 chips de razão** aparecem imediatamente
- [ ] Os chips são: "Muito genérico", "Não se aplica ao meu contexto", "Faltou detalhe regulatório", "Informação incorreta"
- [ ] Sem selecionar um chip, **nenhum feedback é salvo**

### CA-03: Seleção de Chip
- [ ] Ao selecionar um chip, ele fica visualmente destacado
- [ ] Os outros chips ficam **desabilitados**
- [ ] Um **loading** aparece: "Preparando uma nova resposta..."
- [ ] A nova resposta (refinamento) aparece em **stream** na mesma thread

### CA-04: Refinamento
- [ ] O refinamento aparece com label **"🔄 Versão refinada"**
- [ ] O refinamento começa com "Deixa eu reformular:"
- [ ] O refinamento tem seu **próprio FeedbackBar**
- [ ] O PM pode avaliar o refinamento independentemente

### CA-05: Limites
- [ ] Máximo de **3 refinamentos** por mensagem original (depois, o botão 👎 fica desabilitado com tooltip)
- [ ] Uma mensagem com feedback **não permite novo feedback** (botões travados)

---

## Casos de Teste

### CT-01: Fluxo thumbs up
```
DADO que o PM lê uma resposta do mentor
QUANDO clica em 👍
ENTÃO o ícone fica preenchido/ativo
E o POST /api/feedback é chamado com { vote: 'up' }
E a resposta é 201
E o botão 👎 fica desabilitado
```

### CT-02: Fluxo thumbs down completo
```
DADO que o PM lê uma resposta do mentor
QUANDO clica em 👎
ENTÃO os 4 chips aparecem abaixo da FeedbackBar
QUANDO seleciona "Muito genérico"
ENTÃO o POST /api/feedback é chamado com { vote: 'down', reason: 'too_generic' }
E um stream de refinamento começa a aparecer
E a mensagem começa com "Deixa eu reformular:"
```

### CT-03: Thumbs down sem chip não salva
```
DADO que o PM clicou em 👎
QUANDO fecha a janela sem selecionar um chip
ENTÃO nenhum registro de feedback existe no banco para esta mensagem
```

### CT-04: Refinamento sobre refinamento
```
DADO que o PM já deu thumbs down 1x e recebeu refinamento
QUANDO dá thumbs down no refinamento
ENTÃO um segundo refinamento é gerado
QUANDO dá thumbs down no segundo refinamento
ENTÃO um terceiro refinamento é gerado
QUANDO tenta dar thumbs down no terceiro refinamento
ENTÃO o botão 👎 está desabilitado com tooltip "Limite de refinamentos atingido"
```

### CT-05: Feedback duplicado bloqueado
```
DADO que o PM já votou 👍 em uma mensagem
QUANDO tenta clicar em 👎 na mesma mensagem
ENTÃO o botão está desabilitado
E nenhum POST é feito
```

---

## Testes de API

```typescript
describe('POST /api/feedback', () => {
  it('salva thumbs up sem reason', async () => {
    const res = await POST({ sessionId, messageId, vote: 'up' })
    expect(res.status).toBe(201)
    expect(res.body.feedbackId).toBeDefined()
    expect(res.body.refinementTriggered).toBe(false)
  })

  it('salva thumbs down e dispara refinamento', async () => {
    const res = await POST({
      sessionId, messageId,
      vote: 'down',
      reason: 'too_generic'
    })
    expect(res.status).toBe(201)
    expect(res.body.refinementTriggered).toBe(true)
    expect(res.body.refinementMessageId).toBeDefined()
  })

  it('retorna 400 para thumbs down sem reason', async () => {
    const res = await POST({ sessionId, messageId, vote: 'down' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 409 para feedback duplicado', async () => {
    await POST({ sessionId, messageId, vote: 'up' })
    const res = await POST({ sessionId, messageId, vote: 'down', reason: 'too_generic' })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('FEEDBACK_ALREADY_EXISTS')
  })
})
```

---

## Métricas de Validação

| Métrica | Meta | Como medir |
|---------|------|-----------|
| Taxa de aceitação geral | > 75% | feedbacks `up` / total feedbacks |
| Taxa de aceitação de stories (F2) | > 75% | feedbacks `up` em messages tipo `user_story` |
| Chip mais selecionado | monitorar | volume por reason — alerta se `too_generic` > 20% |
| Taxa de feedback (engajamento) | > 50% | mensagens com feedback / total mensagens do assistant |
| Satisfação com refinamento | > 60% | feedbacks `up` em messages tipo `refinement` |
