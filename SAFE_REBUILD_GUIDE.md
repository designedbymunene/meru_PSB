# Safe Docker Rebuild Guide

## What Happened (The Incident)

When you ran `docker compose down && docker compose up -d --build`, you experienced complete data loss because:

1. **`docker compose down`** - Stopped ALL containers and removed them
2. **`--build`** - Rebuilt ALL services from scratch, not just frontend
3. **Auto-migration** - The `migrate` service automatically ran during startup
4. **Destructive migrations** - Your migration setup likely dropped and recreated database tables

## Safe Rebuild Commands

### Rebuild Frontend and Backend Together (Safe)
```bash
docker compose up -d --build web api
```
This rebuilds both the frontend and backend API together without touching the database or running migrations.

### Rebuild Frontend Only (Safe)
```bash
docker compose up -d --build web
```
This only rebuilds the frontend container and won't touch your database.

### Rebuild Backend API Only (Safe)
```bash
docker compose up -d --build api
```
This only rebuilds the backend API container and won't touch your database.

### Restart Services Without Rebuild (Safe)
```bash
docker compose restart web api
```
This restarts both services without rebuilding images.

### Run Migrations Manually (When Needed)
```bash
docker compose --profile migrate up migrate
```
This runs migrations only when you explicitly request them.

## Never Run These Commands (Destructive)

```bash
# ❌ NEVER - Rebuilds everything and runs auto-migrations
docker compose down && docker compose up -d --build

# ❌ NEVER - Same as above, shorter form
docker compose up -d --build
```

## Database Change Workflow (Safe)

When you have database schema changes that need to be applied, follow this **safe sequence**:

### Step-by-Step Process
```bash
# 1. ALWAYS backup first
docker compose --profile backup up backup

# 2. Apply database migrations
docker compose --profile migrate up migrate

# 3. Rebuild affected services (api/web if needed)
docker compose up -d --build api web
```

### Complete Migration One-Liner
```bash
# Full safe deployment with database changes
docker compose --profile backup up backup && \
docker compose --profile migrate up migrate && \
docker compose up -d --build api web
```

### Why This Is Safe
- ✅ **Backup first** - Creates restore point before any changes
- ✅ **Manual migrations** - You control when migrations run
- ✅ **Service-specific rebuild** - Only rebuilds what's needed
- ✅ **Rollback capability** - If something fails, you can restore from backup

### If Migration Fails
With this approach, if a migration fails:
1. You have a fresh backup to restore from
2. The database schema hasn't been changed by the rebuild process
3. You can investigate and fix the migration issue safely

### Quick Reference: When to Use Each Command
```bash
# Frontend changes only
docker compose up -d --build web

# Backend code changes (no database changes)
docker compose up -d --build api

# Both frontend and backend changes (no database changes)
docker compose up -d --build web api

# Database changes required
docker compose --profile backup up backup && \
docker compose --profile migrate up migrate && \
docker compose up -d --build api web
```

## New Safeguards in docker-compose.yml

1. **Manual Migration Profile**: The `migrate` service now requires `--profile migrate` to run
2. **Backup Service**: Added a backup service for manual database dumps
3. **Clear Documentation**: Added comments explaining safe rebuild procedures

## Database Backup

### Manual Backup
```bash
docker compose --profile backup up backup
```

### Automatic Backup (Recommended)
Set up a cron job on your server:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/meru_PSB && docker compose --profile backup up backup
```

## Emergency Recovery

If you accidentally rebuild and lose data:

1. **Check recent backups** in the `./backups/` directory
2. **Restore from backup**:
   ```bash
   docker compose exec -T db psql -U meru_county -d meru_county_psb < backups/backup_YYYYMMDD_HHMMSS.sql
   ```

## Prevention Checklist

- [ ] Always use service-specific rebuilds (`--build web` not `--build`)
- [ ] Set up automatic daily backups
- [ ] Test backup restoration procedure
- [ ] Keep migration scripts non-destructive
- [ ] Never use `docker compose down` for rebuilds
- [ ] Always backup before running migrations

## Additional Utility Commands

### Check Database Status
```bash
docker compose exec db psql -U meru_county -d meru_county_psb -c "SELECT version();"
docker compose exec db psql -U meru_county -d meru_county_psb -c "\dt"  # List tables
```

### View Service Logs
```bash
docker compose logs -f web      # Frontend logs
docker compose logs -f api      # Backend logs
docker compose logs -f db       # Database logs
docker compose logs -f migrate  # Migration logs
```

### Check Container Status
```bash
docker compose ps              # Status of all services
docker compose top             # Running processes
```

### Database Maintenance
```bash
# Vacuum and analyze database (performance)
docker compose exec db psql -U meru_county -d meru_county_psb -c "VACUUM ANALYZE;"

# Check database size
docker compose exec db psql -U meru_county -d meru_county_psb -c "SELECT pg_size_pretty(pg_database_size('meru_county_psb'));"
```

### Backup Management
```bash
# List all backups
ls -lah backups/

# Restore specific backup
docker compose exec -T db psql -U meru_county -d meru_county_psb < backups/backup_20260526_143022.sql

# Clean old backups (keep last 7 days)
find backups/ -name "backup_*.sql" -mtime +7 -delete
```

## Future Improvements

1. **Staging Environment**: Test migrations on staging first
2. **Migration Testing**: Verify migrations preserve data
3. **Monitoring**: Set up alerts for database size changes
4. **Backups**: Implement automated, scheduled backups
5. **Disaster Recovery**: Document recovery procedures

## Common Issues and Solutions

### Application Shows "No Data"
```bash
# Check if database is running
docker compose ps db

# Check database connection
docker compose exec api curl -f http://localhost:3000/health

# Verify database has tables
docker compose exec db psql -U meru_county -d meru_county_psb -c "\dt"
```

### Migration Fails
```bash
# Check migration logs
docker compose logs migrate

# Restore from last backup if migration corrupted data
docker compose exec -T db psql -U meru_county -d meru_county_psb < backups/LATEST_BACKUP.sql

# Fix migration and retry
docker compose --profile migrate up migrate --force-recreate
```

### Container Won't Start
```bash
# Check logs for errors
docker compose logs api

# Rebuild specific service
docker compose up -d --force-recreate api

# Check resource usage
docker stats
```

## Daily Operations Quick Reference

### Morning Checklist
```bash
# Check all services are running
docker compose ps

# Check overnight backups exist
ls -lah backups/ | tail -5

# Check logs for errors
docker compose logs --tail=50 api
```

### Before Making Changes
```bash
# 1. Create backup
docker compose --profile backup up backup

# 2. Check current status
docker compose ps

# 3. Note current backup filename
ls -lah backups/ | tail -1
```

### After Making Changes
```bash
# Verify services are healthy
docker compose ps

# Check logs for errors
docker compose logs --tail=20 api

# Test application functionality
curl http://localhost:3000/health
```

## Emergency Contact and Escalation

If you encounter critical issues:
1. Stop all changes immediately
2. Check backup directory for recent restore points
3. Review logs to identify the failure point
4. Restore from last known good backup if needed
5. Document the incident for future prevention