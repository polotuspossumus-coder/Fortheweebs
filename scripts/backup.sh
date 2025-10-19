#!/bin/bash
# backup.sh - Postgres DB backup and Azure Blob upload

pg_dump -U "$DB_USER" -h "$DB_HOST" -F c "$DB_NAME" > backup_$(date +%F).dump
az storage blob upload --account-name "$AZURE_STORAGE_ACCOUNT" --container-name backups --file backup_$(date +%F).dump --name backup_$(date +%F).dump
