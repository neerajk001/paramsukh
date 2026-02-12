#!/bin/bash

# Hostinger VPS Initial Setup Script
# Run this script once on your VPS to set up the environment

set -e

echo "🚀 Starting Hostinger VPS Setup for SaaS Native..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Setup PM2 to start on boot
sudo pm2 startup systemd -u $USER --hp /home/$USER
sudo systemctl enable pm2-$USER

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Install MongoDB (if not using external service)
echo "📦 Installing MongoDB..."
sudo apt install -y mongodb
sudo systemctl enable mongodb
sudo systemctl start mongodb

# Create application directories
echo "📁 Creating application directories..."
sudo mkdir -p /var/www/saas-native/{backend,admin}
sudo chown -R $USER:$USER /var/www/saas-native

# Create logs directories
mkdir -p /var/www/saas-native/backend/logs
mkdir -p /var/www/saas-native/admin/logs

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Print system info
echo ""
echo "✅ VPS Setup Complete!"
echo ""
echo "📋 System Information:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo ""
echo "📁 Application Directories:"
echo "Backend: /var/www/saas-native/backend"
echo "Admin: /var/www/saas-native/admin"
echo ""
echo "🔧 Next Steps:"
echo "1. Copy your SSH public key to ~/.ssh/authorized_keys"
echo "2. Configure Nginx with the provided config files"
echo "3. Set up SSL certificates with Certbot"
echo "4. Create .env files in application directories"
echo "5. Run deployment scripts to deploy applications"
echo ""
echo "🔐 SSL Setup Commands:"
echo "sudo certbot --nginx -d api.yourdomain.com"
echo "sudo certbot --nginx -d admin.yourdomain.com"
echo ""
echo "👁️  Monitor Applications:"
echo "pm2 status"
echo "pm2 logs"
echo "pm2 monit"
