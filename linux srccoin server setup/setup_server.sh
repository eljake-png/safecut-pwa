#!/bin/bash
# Deployment Guide for Safecut on Ryzen 7 2700 with Ubuntu Server

echo "Step 1: Update package lists"
sudo apt update && sudo apt upgrade -y

echo "Step 2: Install Docker"
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu focal stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update && sudo apt install -y docker.io

echo "Step 3: Install Node.js using nvm"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install --lts=fermium

echo "Step 4: Install Docker Compose"
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Step 5: Clone the project and install dependencies"
# Заміни посилання на свій репозиторій
git clone https://your-repository-url.com/safecut.git && cd safecut

# Встановлення пакетів (Wagmi, Ethers, RainbowKit тощо)
npm install wagmi ethers @ethersproject/providers @tanstack/query-core rainbowkit standalone lucide-react

echo "Step 6: Run Safecut with Docker Compose"
docker-compose up -d

echo "Step 7: Install and configure Cloudflare Tunnel"
sudo apt install -y wireguard

# УВАГА: Посилання в оригіналі було обрізане (...). Використовуй офіційну команду установки:
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared.deb

# Логін (потрібен браузер або копіювання посилання)
sudo cloudflared login

# Створення конфігурації тунелю
# Заміни 'your-tunnel-id' та шляхи на свої реальні дані
sudo nano /etc/cloudflared/config.yml <<EOF
tunnel: your-tunnel-id
credentials-file: /root/.cloudflared/your-credentials.json
ingress:
  - service: http://localhost:8000
    domain: safecut-rivne.trycloudflare.com
EOF

echo "Step 8: Start Cloudflare Tunnel"
sudo cloudflared tunnel run --config /etc/cloudflared/config.yml &

echo "Verification:"
docker ps
node -v
npm -v
curl -I https://safecut-rivne.trycloudflare.com