#!/bin/bash
# restore.sh - Download backup from Azure Blob and restore Postgres DB

az storage blob download --account-name "$AZURE_STORAGE_ACCOUNT" --container-name backups --name "$1" --file restore.dump
pg_restore -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" restore.dump
