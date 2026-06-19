#!/bin/bash
set -e

BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "📦 Backing up database..."
docker exec meru-db-prod pg_dump -U meru_county meru_county_psb | gzip > $BACKUP_FILE

echo "📥 Pulling latest changes..."
git pull

echo "🐳 Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "♻️ Running migrations..."
docker exec meru-api-prod npx drizzle-kit push

echo "✅ Deployment complete! Backup saved as $BACKUP_FILE"
