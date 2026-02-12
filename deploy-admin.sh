#!/bin/bash

# Hostinger VPS Deployment Script for Admin Dashboard
# Usage: ./deploy-admin.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Admin Dashboard Deployment to Hostinger VPS...${NC}"

# Load environment variables
if [ -f .env.deploy ]; then
    source .env.deploy
else
    echo -e "${RED}❌ Error: .env.deploy file not found!${NC}"
    echo "Create .env.deploy with VPS_HOST, VPS_USER, VPS_ADMIN_PATH"
    exit 1
fi

# Validate required variables
if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ] || [ -z "$VPS_ADMIN_PATH" ]; then
    echo -e "${RED}❌ Error: Missing required environment variables${NC}"
    exit 1
fi

# Build locally
echo -e "${YELLOW}🏗️  Building Next.js application...${NC}"
cd admin
npm install
npm run build

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
tar -czf ../admin-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    .
cd ..

# Transfer to VPS
echo -e "${YELLOW}📤 Uploading to VPS...${NC}"
scp admin-deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# Deploy on VPS
echo -e "${YELLOW}🔧 Deploying on VPS...${NC}"
ssh $VPS_USER@$VPS_HOST << EOF
    set -e
    
    # Navigate to deployment directory
    cd $VPS_ADMIN_PATH
    
    # Create backup
    if [ -d "current" ]; then
        echo "📋 Creating backup..."
        BACKUP_DIR="backup-\$(date +%Y%m%d-%H%M%S)"
        cp -r current \$BACKUP_DIR
        echo "Backup saved to \$BACKUP_DIR"
        
        # Keep only last 5 backups
        ls -t | grep backup | tail -n +6 | xargs -r rm -rf
    fi
    
    # Extract new version
    echo "📦 Extracting new version..."
    rm -rf temp && mkdir -p temp
    tar -xzf /tmp/admin-deploy.tar.gz -C temp
    
    # Install production dependencies
    echo "📥 Installing dependencies..."
    cd temp
    npm ci --production
    
    # Replace current version
    cd ..
    rm -rf current
    mv temp current
    
    # Copy environment file
    if [ -f .env.production ]; then
        cp .env.production current/.env.production.local
    fi
    
    # Restart with PM2
    echo "♻️  Restarting application..."
    cd current
    pm2 restart admin || pm2 start npm --name admin -- start
    pm2 save
    
    # Cleanup
    rm /tmp/admin-deploy.tar.gz
    
    echo "✅ Admin dashboard deployed successfully!"
    pm2 status
EOF

# Cleanup local file
rm admin-deploy.tar.gz

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}🔍 Check status: ssh $VPS_USER@$VPS_HOST 'pm2 status'${NC}"
