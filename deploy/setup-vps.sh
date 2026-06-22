#!/bin/bash

# VPS Initial Setup Script for Translation Service
# Run this script on a fresh Ubuntu/Debian VPS

set -e

echo "=== Translation Service VPS Setup ==="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install nginx
echo "Installing nginx..."
sudo apt install -y nginx

# Install git
echo "Installing git..."
sudo apt install -y git

# Create app directory
echo "Creating application directory..."
sudo mkdir -p /var/www/translation-service
sudo chown $USER:$USER /var/www/translation-service

# Clone repository
echo "Cloning repository..."
cd /var/www
git clone https://github.com/fruitcc/translation-service-gemini.git translation-service
cd translation-service

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Create logs directory
mkdir -p logs

# Create .env file
echo "Creating .env file..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
GEMINI_API_KEY=YOUR_API_KEY_HERE
# Browser origins allowed to call the API (comma-separated), or '*' for any.
# CORS only guards browsers; it does nothing for native/hybrid mobile apps and
# adds no security to this no-auth API, so '*' is the right default here.
# To lock down to specific web frontends instead: ALLOWED_ORIGINS=https://app.example.com
ALLOWED_ORIGINS=*
EOF

echo "Please edit /var/www/translation-service/.env and add your GEMINI_API_KEY"

# Setup PM2
echo "Setting up PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# Configure nginx
echo "Configuring nginx..."
sudo tee /etc/nginx/sites-available/translation-service > /dev/null << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_HERE;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/translation-service /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup firewall
echo "Setting up firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Edit /var/www/translation-service/.env and add your GEMINI_API_KEY"
echo "2. Edit /etc/nginx/sites-available/translation-service and update YOUR_DOMAIN_HERE"
echo "3. Restart nginx: sudo systemctl restart nginx"
echo "4. Consider setting up SSL with certbot"
echo "5. Check PM2 status: pm2 status"