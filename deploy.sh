#!/bin/bash
set -e

# Use docker compose (v2) or docker-compose (v1)
DOCKER_COMPOSE="docker compose"
if ! docker compose version &>/dev/null; then
    DOCKER_COMPOSE="docker-compose"
fi

BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "📦 Backing up database..."
if docker ps | grep -q "meru-db-prod"; then
    docker exec meru-db-prod pg_dump -U meru_county meru_county_psb | gzip > $BACKUP_FILE
    echo "✅ Backup saved as $BACKUP_FILE"
else
    echo "⚠️  Database container not running - skipping backup"
    echo "💾 A backup will be created after services start"
    BACKUP_AFTER_DEPLOY=true
fi

echo "📥 Pulling latest changes..."
git pull

echo "🐳 Pulling latest Docker images..."
$DOCKER_COMPOSE -f docker-compose.prod.yml pull

echo "🔨 Building and starting services..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 15

echo "♻️ Running migrations..."
docker exec meru-api-prod npx drizzle-kit push

# Create backup after deployment if it wasn't done before
if [ "$BACKUP_AFTER_DEPLOY" = true ]; then
    echo "📦 Creating post-deployment backup..."
    docker exec meru-db-prod pg_dump -U meru_county meru_county_psb | gzip > $BACKUP_FILE
    echo "✅ Backup saved as $BACKUP_FILE"
fi

echo "✅ Deployment complete!"
