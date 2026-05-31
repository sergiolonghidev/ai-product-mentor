#!/usr/bin/env bash
# Exporta todas as tabelas do aipm via Supabase REST API
# Requer: kubectl com KUBECONFIG configurado e acesso ao namespace supabase
set -e

BACKUP_DIR="$(dirname "$0")/../backups"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d-%H%M%S)
OUT_DIR="$BACKUP_DIR/aipm-$DATE"
mkdir -p "$OUT_DIR"

TOKEN=$(kubectl get secret aipm-secrets -n aipm -o jsonpath='{.data.SUPABASE_SERVICE_ROLE_KEY}' | base64 -d)

echo "[backup] Abrindo port-forward para supabase-kong..."
kubectl port-forward -n supabase svc/supabase-kong 18000:8000 &
PF_PID=$!
sleep 3

for TABLE in Session Message UserStory Feedback PRD; do
  FILE="$OUT_DIR/${TABLE}.json"
  HTTP=$(curl -s -w "%{http_code}" -o "$FILE" \
    -H "Authorization: Bearer $TOKEN" \
    -H "apikey: $TOKEN" \
    "http://localhost:18000/rest/v1/${TABLE}?select=*" 2>/dev/null)
  if [ "$HTTP" = "200" ]; then
    COUNT=$(python3 -c "import json; d=json.load(open('$FILE')); print(len(d) if isinstance(d,list) else '?')" 2>/dev/null)
    echo "[backup] $TABLE: $COUNT rows -> $FILE"
  else
    echo "[backup] $TABLE: HTTP $HTTP (tabela pode não existir ainda)"
    rm -f "$FILE"
  fi
done

kill $PF_PID 2>/dev/null
echo "[backup] Concluído em $OUT_DIR"
