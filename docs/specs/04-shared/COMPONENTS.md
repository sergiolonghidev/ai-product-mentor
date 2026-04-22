# COMPONENTS.md — Componentes de UI Reutilizáveis

> Componentes compartilhados entre features. Implementar uma vez, usar em todos os lugares.

---

## StreamingText

Renderiza texto que chega progressivamente via SSE.

```typescript
type StreamingTextProps = {
  content: string           // texto acumulado até agora
  isStreaming: boolean      // true = cursor piscando no final
  className?: string
}
```

**Comportamento:**
- Exibe cursor `█` piscando enquanto `isStreaming === true`
- Suporta markdown básico (bold, listas, parágrafos)
- Não re-renderiza o texto já exibido (usa `useMemo`)

---

## LoadingSpinner

```typescript
type LoadingSpinnerProps = {
  label?: string            // ex: "Verificando conformidade..."
  size?: 'sm' | 'md' | 'lg'
}
```

---

## ErrorMessage

Exibe erros de forma amigável (sem código técnico).

```typescript
type ErrorMessageProps = {
  code: ErrorCode
  onRetry?: () => void      // se presente, exibe botão "Tentar novamente"
}
```

---

## CopyButton

Botão que copia texto para a área de transferência com feedback visual.

```typescript
type CopyButtonProps = {
  textToCopy: string
  label?: string            // default: "Copiar"
  successLabel?: string     // default: "Copiado!"
  successDurationMs?: number // default: 2000
}
```

---

## Badge

Indicador visual de categoria ou status.

```typescript
type BadgeProps = {
  variant: 'compliance' | 'functional' | 'ux' | 'performance'
           | 'red' | 'amber' | 'green'
           | 'pending' | 'complete'
  label: string
  size?: 'sm' | 'md'
}
```

**Mapeamento de cores:**
| Variant | Background | Text |
|---------|-----------|------|
| `compliance` | blue-100 | blue-800 |
| `functional` | gray-100 | gray-800 |
| `ux` | purple-100 | purple-800 |
| `performance` | orange-100 | orange-800 |
| `red` | red-50 | red-700 |
| `amber` | yellow-50 | yellow-700 |
| `green` | green-50 | green-700 |
| `pending` | gray-50 | gray-500 |
| `complete` | green-50 | green-700 |

---

## ProgressDots

Indicador de progresso step-by-step (usado no onboarding).

```typescript
type ProgressDotsProps = {
  total: number
  current: number           // 1-indexed
}
```

---

## Convenções de Estilo

- **Font:** Inter (system fallback: sans-serif)
- **Radius padrão:** `rounded-lg` (8px)
- **Sombras:** Apenas `shadow-sm` — sem sombras pesadas no MVP
- **Cores de ação:** `blue-600` para ações primárias
- **Cor de perigo:** `red-600` para riscos críticos
- **Espaçamento interno dos cards:** `p-4` ou `p-6`
- **Largura máxima do chat:** `max-w-2xl mx-auto`
