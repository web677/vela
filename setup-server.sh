#!/bin/bash

# ==========================================
# Vela Server Setup Script (Ubuntu 24.04 LTS)
# ==========================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Vela Server Setup...${NC}"

# 1. Update System
echo -e "\n${YELLOW}📦 Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# 2. Configure Firewall (UFW)
echo -e "\n${YELLOW}🛡️ Configuring Firewall (UFW)...${NC}"
# Allow SSH (OpenSSH)
sudo ufw allow OpenSSH
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Allow Backend API (if accessed directly, otherwise Nginx handles it)
sudo ufw allow 3580/tcp
# Enable UFW
echo "y" | sudo ufw enable
sudo ufw status

# 3. Install Docker & Docker Compose
echo -e "\n${YELLOW}🐳 Installing Docker...${NC}"
# Add Docker's official GPG key:
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify Docker installation
sudo docker --version
sudo docker compose version

# 4. Install Git & Configure SSH
echo -e "\n${YELLOW}🔧 Installing Git & Configuring SSH...${NC}"
sudo apt-get install -y git

# Generate SSH Key if not exists
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo -e "Generating SSH Key..."
    ssh-keygen -t ed25519 -C "vela-server-deploy" -f ~/.ssh/id_ed25519 -N ""
    echo -e "${GREEN}✅ SSH Key generated!${NC}"
    echo -e "${YELLOW}👉 Please add this public key to your GitHub/GitLab Deploy Keys:${NC}"
    cat ~/.ssh/id_ed25519.pub
    echo -e ""
fi

# 5. Install Fail2Ban (Security)
echo -e "\n${YELLOW}🛡️ Installing Fail2Ban...${NC}"
sudo apt-get install -y fail2ban
# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 6. Configure Firewall (UFW)
echo -e "\n${YELLOW}🛡️ Updating Firewall Rules...${NC}"
# Allow SSH
sudo ufw allow OpenSSH
# Allow HTTP/HTTPS (Nginx Proxy Manager)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Allow NPM Admin Panel
sudo ufw allow 81/tcp
# Allow Portainer
sudo ufw allow 9000/tcp
# Allow Backend API (Optional, if accessed directly)
sudo ufw allow 3580/tcp

echo "y" | sudo ufw enable
sudo ufw reload

# 7. Prepare Project Directory
echo -e "\n${YELLOW}📂 Creating project directory...${NC}"
PROJECT_DIR="/opt/vela"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR
chmod 755 $PROJECT_DIR

# 8. Start Management Services
echo -e "\n${YELLOW}🚀 Starting Management Services...${NC}"
# Create management compose file if not exists (in case script is run standalone)
if [ -f "docker-compose.management.yml" ]; then
    sudo docker compose -f docker-compose.management.yml up -d
    echo -e "${GREEN}✅ Management services started!${NC}"
else
    echo -e "${YELLOW}⚠️ docker-compose.management.yml not found, skipping management services startup.${NC}"
fi

echo -e "\n${GREEN}✅ Server Setup Complete!${NC}"
echo -e "\nManagement URLs:"
echo -e "- Nginx Proxy Manager: ${YELLOW}http://<server-ip>:81${NC} (Default: admin@example.com / changeme)"
echo -e "- Portainer:           ${YELLOW}http://<server-ip>:9000${NC}"
echo -e "\nNext steps:"
echo -e "1. Add the SSH key above to your Git repository"
echo -e "2. Clone your repo: ${YELLOW}git clone <repo_url> $PROJECT_DIR${NC}"
echo -e "3. Configure .env and start services"
