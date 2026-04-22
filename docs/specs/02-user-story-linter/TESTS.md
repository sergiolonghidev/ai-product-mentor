# TESTS.md — F2: Gerador de User Story + Linter de Compliance

---

## Critérios de Aceite

### CA-01: Geração da User Story
- [ ] A story gerada contém as 3 partes: Como / Quero / Para que
- [ ] A persona **não** é genérica ("o usuário") — é específica ao contexto do squad
- [ ] Há entre **3 e 6 critérios** de aceite
- [ ] Cada critério tem uma **categoria** identificável (functional/compliance/ux/performance)
- [ ] Critérios de compliance são **visualmente distintos** dos funcionais

### CA-02: Streaming
- [ ] O texto da User Story aparece **progressivamente** (stream)
- [ ] O PM **não precisa esperar** o linter para ver a story

### CA-03: Linter — timing
- [ ] O painel do linter mostra **"Verificando conformidade..."** enquanto processa
- [ ] O resultado do linter aparece **após** a story estar completa
- [ ] Se o linter demorar mais de 30s, exibe mensagem de erro (não trava a UI)

### CA-04: Linter — resultado
- [ ] Máximo **2 riscos vermelhos** exibidos
- [ ] Cada risco exibe: título, descrição, normativo de referência e sugestão
- [ ] Riscos verdes são agrupados como contador ("X itens verificados ✓")
- [ ] Riscos âmbar são exibidos em lista colapsável

### CA-05: Falha do linter
- [ ] Se o linter falhar, a **User Story permanece** na tela sem erro
- [ ] O painel do linter exibe **"Verificação indisponível"** (não error genérico)
- [ ] O PM pode **copiar** a story mesmo sem resultado do linter

### CA-06: Cópia da story
- [ ] Botão "Copiar" copia a story formatada para a área de transferência
- [ ] Após copiar, o botão exibe **"Copiado!"** por 2 segundos

---

## Casos de Teste

### CT-01: Story com risco crítico (CET ausente)
```
DADO que o PM está em uma sessão com functionalityType = 'parcelamento'
QUANDO descreve "Quero criar um botão para o usuário parcelar a fatura"
E a story gerada não menciona CET nos critérios de aceite
ENTÃO o linter deve retornar RULE-001 com level RED
E deve aparecer no LinterPanel como risco crítico
E a sugestão deve mencionar "CET"
```

### CT-02: Story sem riscos críticos
```
DADO que o PM descreve uma funcionalidade de consulta de extrato
QUANDO a story gerada inclui critérios de acessibilidade e dados claros
ENTÃO o linter retorna apenas itens GREEN
E o LinterPanel exibe "Nenhum risco crítico identificado"
```

### CT-03: Linter não bloqueia visualização da story
```
DADO que a LLM de linting está com alta latência (15s)
QUANDO o PM gera uma story
ENTÃO a story aparece completa em < 8s
E o linter aparece como "pendente" sem bloquear a leitura
E ao completar (15s), o painel atualiza sem refresh de página
```

### CT-04: Falha total do linter
```
DADO que o endpoint /api/story/lint retorna 503
QUANDO o PM gera uma story
ENTÃO a story é exibida normalmente
E o LinterPanel exibe "Verificação indisponível. A story foi gerada normalmente."
E o botão "Copiar" está disponível
```

### CT-05: Máximo de 2 riscos vermelhos
```
DADO que o linter identifica 4 riscos RED internamente
QUANDO o servidor processa o resultado
ENTÃO o cliente recebe apenas 2 riscos RED
E os outros 2 são agrupados como 1 risco AMBER "Outros riscos identificados"
```

### CT-06: Botão copiar
```
DADO que uma User Story foi gerada
QUANDO o PM clica em "Copiar"
ENTÃO a área de transferência contém a story formatada com quebras de linha
E o botão exibe "Copiado!" por exatamente 2 segundos
E depois volta a exibir "Copiar"
```

---

## Testes de API

### `POST /api/story/generate`

```typescript
describe('POST /api/story/generate', () => {
  it('retorna stream com story válida para input correto', async () => {
    const events = await collectSSEEvents('/api/story/generate', {
      sessionId: validSessionId,
      description: 'Criar fluxo de parcelamento da fatura'
    })
    
    const completeEvent = events.find(e => e.type === 'story_complete')
    expect(completeEvent).toBeDefined()
    expect(completeEvent.data.story.persona).toBeTruthy()
    expect(completeEvent.data.story.acceptanceCriteria.length).toBeGreaterThanOrEqual(3)
    expect(completeEvent.data.lintStatus).toBe('pending')
  })

  it('retorna 404 para sessionId inválido', async () => {
    const res = await POST({ sessionId: 'invalid-uuid', description: '...' })
    expect(res.status).toBe(404)
  })
})
```

### `POST /api/story/lint`

```typescript
describe('POST /api/story/lint', () => {
  it('retorna máximo 2 riscos RED', async () => {
    const res = await POST({ storyId: storyWithManyRisks, sessionId })
    expect(res.body.lintResult.risks.filter(r => r.level === 'red').length)
      .toBeLessThanOrEqual(2)
  })

  it('retorna 409 se linter já rodou para esta story', async () => {
    await POST({ storyId, sessionId }) // primeira vez
    const res = await POST({ storyId, sessionId }) // segunda vez
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('LINT_ALREADY_COMPLETE')
  })
})
```

---

## Métricas de Validação no Piloto

| Métrica | Meta | Como medir |
|---------|------|-----------|
| Cards reabertos pós-uso | -30% | Comparar no Jira: 30 dias antes vs 30 dias depois |
| Taxa de aceitação de stories | > 75% | Feedbacks `up` / total feedbacks em mensagens tipo `user_story` |
| Falso positivo do linter | < 15% | Feedbacks `down` com reason `wrong_context` em mensagens com lintResult |
| Latência story (P95) | < 8s | Tempo entre envio do request e evento `story_complete` |
| Latência linter (P95) | < 15s | Tempo entre `story_complete` e `lintResult` completo |
