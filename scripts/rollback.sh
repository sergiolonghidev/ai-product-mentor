#!/usr/bin/env bash
# Rollback do ProdPilot AI para uma imagem/tag anterior
# Uso: ./scripts/rollback.sh [TAG]
# Exemplo: ./scripts/rollback.sh v1.0.0-mvp
set -e

TARGET_TAG="${1:-v1.0.0-mvp}"
IMAGE="harbor.lab/library/aipm:$TARGET_TAG"
NAMESPACE="aipm"
DEPLOYMENT="aipm"

echo "[rollback] Verificando imagem: $IMAGE"
docker manifest inspect "$IMAGE" > /dev/null 2>&1 || {
  echo "[rollback] ERRO: imagem $IMAGE não encontrada no Harbor"
  exit 1
}

echo "[rollback] Atualizando deployment $DEPLOYMENT para $IMAGE..."
kubectl set image "deployment/$DEPLOYMENT" "$DEPLOYMENT=$IMAGE" -n "$NAMESPACE"

echo "[rollback] Aguardando rollout..."
kubectl rollout status "deployment/$DEPLOYMENT" -n "$NAMESPACE" --timeout=120s

echo "[rollback] Verificando pod..."
kubectl get pods -n "$NAMESPACE"

echo ""
echo "[rollback] Concluído. App rodando com: $IMAGE"
echo "[rollback] Para verificar: kubectl logs -n $NAMESPACE -l app=$DEPLOYMENT --tail=20"
