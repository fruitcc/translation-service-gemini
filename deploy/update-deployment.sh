#!/bin/bash

# Update Deployment Script
# Run this on the VPS to pull latest changes and restart

set -e

echo "=== Updating Translation Service ==="

cd /var/www/translation-service

# Backup current .env
cp .env .env.backup

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin main

# Install/update dependencies
echo "Updating dependencies..."
npm install --production

# Restore .env
cp .env.backup .env

# Reload PM2
echo "Restarting application with PM2..."
pm2 reload translation-service

# Check status
pm2 status

echo "=== Update Complete ==="
echo "Service has been updated and restarted"