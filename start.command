#!/bin/bash
# ── Detrás del Cartel Launcher ─────────────────────────────────────────
# Doble clic (o "▶ Abrir" en el panel del 8002) para arrancar la web del podcast.
# App independiente. Solo escucha en 127.0.0.1.
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=5173
LOG="${TMPDIR:-/tmp}/detras-del-cartel-dev.log"
cd "$APP_DIR"

if lsof -ti:$PORT -sTCP:LISTEN >/dev/null; then
    echo "🎙️  Detrás del Cartel ya está corriendo."
else
    [ -d node_modules ] || npm install
    echo "🎙️  Detrás del Cartel — iniciando en http://localhost:$PORT"
    nohup npm run dev -- --host 127.0.0.1 --port $PORT --strictPort > "$LOG" 2>&1 &
    for i in $(seq 1 30); do curl -s -o /dev/null "http://localhost:$PORT" && break; sleep 1; done
fi
open "http://localhost:$PORT"
