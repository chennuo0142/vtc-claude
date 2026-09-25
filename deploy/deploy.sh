#!/usr/bin/env bash
# Déploie l'application sur le serveur sans passer par GitHub Actions.
# Reproduit les étapes de .github/workflows/deploy.yml : copie du code, npm ci,
# prisma generate, migrate deploy, build, rechargement PM2.
#
# Le code envoyé est celui du répertoire de travail local (commité ou non).
# Jamais écrasés côté serveur : .env, public/uploads, node_modules, .next.
#
# Usage : deploy/deploy.sh [--dry-run] [--yes] [--skip-checks] [--skip-migrate]
#   --dry-run       affiche les fichiers qui seraient synchronisés, sans rien modifier
#   --yes           ne demande pas de confirmation
#   --skip-checks   saute le typecheck local
#   --skip-migrate  n'applique pas les migrations Prisma
#
# Variables : DEPLOY_HOST (192.168.0.137), DEPLOY_USER (chennuo),
#             DEPLOY_PATH (/home/chennuo/apps/vtc-claude)
set -euo pipefail

HOST="${DEPLOY_HOST:-192.168.0.137}"
REMOTE_USER="${DEPLOY_USER:-chennuo}"
REMOTE_PATH="${DEPLOY_PATH:-/home/chennuo/apps/vtc-claude}"
TARGET="${REMOTE_USER}@${HOST}"

DRY_RUN=0
ASSUME_YES=0
SKIP_CHECKS=0
SKIP_MIGRATE=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --yes|-y) ASSUME_YES=1 ;;
    --skip-checks) SKIP_CHECKS=1 ;;
    --skip-migrate) SKIP_MIGRATE=1 ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $arg" >&2; exit 1 ;;
  esac
done

cd "$(dirname "$0")/.."

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=10)
RSYNC_EXCLUDES=(
  --exclude=/.git/
  --exclude=/node_modules/
  --exclude=/.next/
  --exclude='/.env*'
  --exclude=/public/uploads/
  --exclude=/src/generated/prisma/
  --exclude=/Assets/
  --exclude=/Templates/
  --exclude='*.tsbuildinfo'
  --exclude=/next-env.d.ts
  --exclude=.DS_Store
)

if [ "$DRY_RUN" -eq 1 ]; then
  echo "==> Simulation : fichiers qui seraient synchronisés vers ${TARGET}:${REMOTE_PATH}"
  rsync -az --delete --dry-run --itemize-changes "${RSYNC_EXCLUDES[@]}" \
    -e "ssh ${SSH_OPTS[*]}" ./ "${TARGET}:${REMOTE_PATH}/"
  exit 0
fi

if [ "$SKIP_CHECKS" -eq 0 ]; then
  echo "==> Vérification des types (tsc)"
  npx tsc --noEmit
fi

if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "Attention : le répertoire contient des modifications non commitées ; elles seront déployées."
fi

if [ "$ASSUME_YES" -eq 0 ]; then
  read -r -p "Déployer sur ${TARGET}:${REMOTE_PATH} (migrations : $([ "$SKIP_MIGRATE" -eq 1 ] && echo non || echo oui)) ? [y/N] " answer
  [[ "$answer" =~ ^[yYoO]$ ]] || { echo "Annulé."; exit 1; }
fi

echo "==> Synchronisation du code"
rsync -az --delete --itemize-changes "${RSYNC_EXCLUDES[@]}" \
  -e "ssh ${SSH_OPTS[*]}" ./ "${TARGET}:${REMOTE_PATH}/"

echo "==> Build et rechargement sur ${HOST}"
ssh "${SSH_OPTS[@]}" "$TARGET" bash -s -- "$REMOTE_PATH" "$SKIP_MIGRATE" <<'REMOTE'
set -euo pipefail
cd "$1"
SKIP_MIGRATE="$2"

echo "-- npm ci"
npm ci
echo "-- prisma generate"
npx prisma generate
if [ "$SKIP_MIGRATE" -eq 0 ]; then
  echo "-- prisma migrate deploy"
  npx prisma migrate deploy
fi
echo "-- build"
npm run build
echo "-- pm2"
pm2 startOrReload ecosystem.config.js
pm2 save
REMOTE

echo "==> Déploiement terminé : http://${HOST}:3003"
