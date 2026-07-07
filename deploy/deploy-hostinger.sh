#!/usr/bin/env bash
# Deploy script for Hostinger VPS (Ubuntu 22.04+)
# Usage: sudo ./deploy-hostinger.sh <domain> <git_repo_url> [branch] [email_for_certbot]
# Example: sudo ./deploy-hostinger.sh example.com https://github.com/you/CyberHunt.git main admin@example.com

set -euo pipefail
DOMAIN="$1"
REPO="$2"
BRANCH="${3:-main}"
EMAIL="${4:-}" # optional email for certbot; if empty certbot will prompt
APP_DIR="/var/www/cyberhunt"
NGINX_SITE="/etc/nginx/sites-available/cyberhunt"

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo: sudo $0 $@"
  exit 1
fi

echo "Deploying CyberHunt for domain: $DOMAIN"

# 1) System packages
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx certbot python3-certbot-nginx build-essential ufw

# 2) Firewall (allow SSH + HTTP/HTTPS)
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
ufw --force enable || true

# 3) Clone or update app
mkdir -p "$APP_DIR"
chown $SUDO_USER:$SUDO_USER "$APP_DIR" || true
if [ -d "$APP_DIR/.git" ]; then
  echo "Updating existing repository..."
  su -c "cd $APP_DIR && git fetch --all && git reset --hard origin/$BRANCH" $SUDO_USER
else
  echo "Cloning repository..."
  su -c "git clone --depth 1 --branch $BRANCH $REPO $APP_DIR" $SUDO_USER
fi

# 4) Prepare environment file
if [ ! -f "$APP_DIR/.env.production" ]; then
  if [ -f "$APP_DIR/.env.production.example" ]; then
    echo "Creating .env.production from example (you must edit it with real secrets)"
    cp "$APP_DIR/.env.production.example" "$APP_DIR/.env.production"
    chown $SUDO_USER:$SUDO_USER "$APP_DIR/.env.production"
    chmod 600 "$APP_DIR/.env.production"
  else
    echo "No .env.production.example found. Create $APP_DIR/.env.production with required envs before building."
  fi
else
  echo ".env.production already exists."
fi

# 5) Install node deps and build as non-root user
su -c "cd $APP_DIR && npm ci && npm run build" $SUDO_USER

# 6) PM2 install and start
npm install -g pm2
# Use pm2 to run npm start (Next's 'next start' runs on port 3000 by default)
su -c "cd $APP_DIR && pm2 start npm --name cyberhunt -- start" $SUDO_USER
pm2 save
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

# 7) Nginx config (use template if repo contains it), else create basic proxy
if [ -f "$APP_DIR/deploy/nginx/cyberhunt" ]; then
  echo "Using bundled nginx template from repo"
  sed "s/yourdomain.com/$DOMAIN/g" "$APP_DIR/deploy/nginx/cyberhunt" > "$NGINX_SITE"
else
  echo "Writing default nginx server block to $NGINX_SITE"
  cat > "$NGINX_SITE" <<EOF
server {
  listen 80;
  server_name $DOMAIN www.$DOMAIN;

  client_max_body_size 20M;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /_next/ {
    proxy_pass http://127.0.0.1:3000;
  }
}
EOF
fi

# Enable site and reload nginx
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/cyberhunt
nginx -t
systemctl reload nginx

# 8) Obtain TLS certificate (non-interactive if email provided)
if [ -n "$EMAIL" ]; then
  certbot --nginx -n --agree-tos --email "$EMAIL" -d "$DOMAIN" -d "www.$DOMAIN"
else
  echo "No email provided for certbot. Running interactive certbot (you may be prompted)."
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"
fi

# 9) Final notes
echo "Deployment finished."
echo "IMPORTANT: Edit $APP_DIR/.env.production with real secrets (Upstash, Supabase, JWT keys) if you haven't already."
echo "To view PM2 logs: pm2 logs cyberhunt"
echo "To tail nginx logs: tail -f /var/log/nginx/error.log /var/log/nginx/access.log"

exit 0
