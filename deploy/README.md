# Deployment Guide for Linode VPS

This guide will help you deploy the translation service on a Linode VPS running Ubuntu/Debian.

## Prerequisites

- A Linode VPS with Ubuntu 22.04 or Debian 11+
- Root or sudo access to the VPS
- A domain name pointed to your VPS IP (optional but recommended)
- Your Gemini API key

## Quick Start

### 1. Initial VPS Setup

SSH into your VPS and run:

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/fruitcc/translation-service-gemini/main/deploy/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

### 2. Configure Environment

Edit the `.env` file with your API key:

```bash
nano /var/www/translation-service/.env
```

Add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Configure Nginx (if using domain)

Edit the nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/translation-service
```

Replace `YOUR_DOMAIN_HERE` with your actual domain.

### 4. Setup SSL (optional but recommended)

If you have a domain, set up SSL:

```bash
cd /var/www/translation-service/deploy
chmod +x ssl-setup.sh
./ssl-setup.sh your-domain.com
```

## Manual Deployment Steps

If you prefer manual setup:

### Step 1: System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2, nginx, git
sudo npm install -g pm2
sudo apt install -y nginx git
```

### Step 2: Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/translation-service
sudo chown $USER:$USER /var/www/translation-service

# Clone repository
cd /var/www
git clone https://github.com/fruitcc/translation-service-gemini.git translation-service
cd translation-service

# Install dependencies
npm install --production

# Create logs directory
mkdir -p logs
```

### Step 3: Environment Configuration

Create `.env` file:

```bash
cat > .env << EOF
NODE_ENV=production
PORT=3001
GEMINI_API_KEY=your_api_key_here
EOF
```

### Step 4: PM2 Process Management

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the command it outputs
```

### Step 5: Nginx Reverse Proxy

Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/translation-service
```

Add configuration (see ssl-setup.sh for template).

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/translation-service /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Updating the Deployment

To update to the latest version:

```bash
cd /var/www/translation-service
./deploy/update-deployment.sh
```

Or manually:

```bash
cd /var/www/translation-service
git pull origin main
npm install --production
pm2 reload translation-service
```

## Automated Deployment with GitHub Actions

1. Add these secrets to your GitHub repository:
   - `VPS_HOST`: Your VPS IP or domain
   - `VPS_USERNAME`: SSH username (usually `root` or your user)
   - `VPS_SSH_KEY`: Your private SSH key
   - `VPS_PORT`: SSH port (usually 22)

2. Push to main branch to trigger automatic deployment

## Monitoring and Maintenance

### Check Application Status

```bash
pm2 status
pm2 logs translation-service
```

### View Logs

```bash
# PM2 logs
pm2 logs

# Application logs
tail -f /var/www/translation-service/logs/out.log
tail -f /var/www/translation-service/logs/err.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart application
pm2 restart translation-service

# Restart nginx
sudo systemctl restart nginx
```

### Monitor Resources

```bash
# Check PM2 metrics
pm2 monit

# System resources
htop
```

## Troubleshooting

### Service not responding

1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs`
3. Verify nginx is running: `sudo systemctl status nginx`
4. Check firewall: `sudo ufw status`

### High memory usage

```bash
# Restart with memory limit
pm2 delete translation-service
pm2 start ecosystem.config.js --max-memory-restart 1G
```

### SSL certificate issues

```bash
# Renew certificate manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Security Best Practices

1. **Keep system updated**: Run `sudo apt update && sudo apt upgrade` regularly
2. **Use SSH keys**: Disable password authentication
3. **Configure fail2ban**: Protect against brute force attacks
4. **Regular backups**: Backup your `.env` file and database if applicable
5. **Monitor logs**: Check for suspicious activity regularly
6. **Use strong API keys**: Rotate keys periodically

## Performance Optimization

1. **Enable PM2 cluster mode**: Already configured in ecosystem.config.js
2. **Configure nginx caching**: For static assets if any
3. **Use CDN**: For better global performance
4. **Monitor with PM2**: `pm2 monit` for real-time metrics

## Support

For issues specific to:
- Application: Check the main repository issues
- PM2: https://pm2.keymetrics.io/docs/
- Nginx: https://nginx.org/en/docs/
- Linode: https://www.linode.com/docs/