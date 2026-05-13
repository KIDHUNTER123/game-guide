#!/bin/bash
# ============================================
# 游戏攻略网站 - VPS 一键部署脚本
# 适用于 Ubuntu 20.04+ / Debian 11+ / CentOS 8+
# 使用方法: chmod +x deploy.sh && sudo ./deploy.sh
# ============================================

set -e

APP_NAME="game-guides"
APP_DIR="/opt/$APP_NAME"
DOMAIN="${1:-localhost}"  # 第一个参数为域名，没有则用 localhost

echo "=========================================="
echo "  游戏攻略网站部署脚本"
echo "  域名: $DOMAIN"
echo "=========================================="

# -------------------- 1. 安装系统依赖 --------------------
echo "[1/7] 安装系统依赖..."

if [ -f /etc/debian_version ]; then
    apt-get update -y
    apt-get install -y curl git nginx certbot python3-certbot-nginx
elif [ -f /etc/redhat-release ]; then
    yum install -y epel-release
    yum install -y curl git nginx certbot python3-certbot-nginx
fi

# -------------------- 2. 安装 Node.js 20 --------------------
echo "[2/7] 安装 Node.js 20..."

if command -v node &> /dev/null; then
    echo "Node.js 已安装: $(node -v)"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# -------------------- 3. 安装 PM2 --------------------
echo "[3/7] 安装 PM2..."

if command -v pm2 &> /dev/null; then
    echo "PM2 已安装"
else
    npm install -g pm2
fi

# -------------------- 4. 创建项目目录 --------------------
echo "[4/7] 准备项目目录..."
mkdir -p "$APP_DIR"

# -------------------- 5. 配置环境变量 --------------------
echo "[5/7] 配置环境变量..."

if [ ! -f "$APP_DIR/.env" ]; then
    # 生成随机 AUTH_SECRET
    AUTH_SECRET=$(openssl rand -base64 32)

    cat > "$APP_DIR/.env" << ENVEOF
DATABASE_URL="file:./dev.db"
AUTH_SECRET="$AUTH_SECRET"
ENVEOF

    echo "已生成 .env 文件，AUTH_SECRET 已随机生成"
else
    echo ".env 文件已存在，跳过"
fi

# -------------------- 6. 配置 Nginx --------------------
echo "[6/7] 配置 Nginx..."

NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"

cat > "$NGINX_CONF" << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    # 上传文件大小限制
    client_max_body_size 10m;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 静态文件直接由 Nginx 提供（可选，能减轻 Node.js 压力）
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600";
    }

    location /uploads {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=86400";
    }
}
NGINXEOF

# 启用站点
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
echo "Nginx 配置完成"

# -------------------- 7. 配置 PM2 启动 --------------------
echo "[7/7] 配置 PM2 进程守护..."

# 如果已有实例则删除
pm2 delete "$APP_NAME" 2>/dev/null || true

cat > "$APP_DIR/ecosystem.config.js" << PM2EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    cwd: '$APP_DIR',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/$APP_NAME-error.log',
    out_file: '/var/log/$APP_NAME-out.log',
    merge_logs: true,
    max_memory_restart: '500M',
  }]
}
PM2EOF

pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save
pm2 startup systemd -u "$(whoami)" --hp "$HOME"

echo ""
echo "=========================================="
echo "  基础环境安装完成！"
echo ""
echo "  接下来请手动执行项目部署步骤："
echo "  1. cd $APP_DIR"
echo "  2. 上传项目文件（排除 node_modules 和 .next）"
echo "  3. npm install"
echo "  4. npx prisma generate"
echo "  5. npx prisma db push"
echo "  6. npx tsx prisma/seed.ts"
echo "  7. npm run build"
echo "  8. pm2 restart $APP_NAME"
echo ""
echo "  如需要配置 HTTPS："
echo "  certbot --nginx -d $DOMAIN"
echo "=========================================="
