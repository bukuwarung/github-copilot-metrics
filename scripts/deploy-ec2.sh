#!/bin/bash
# Single-instance deployment script for copilot-metrics-dashboard
# For use on Ubuntu 24.04 with Node.js 22 on t4g.small instances

# Exit on any error
set -e

# Update system packages
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y build-essential git

# Install Node.js 22 using NVM if not already installed
if ! command -v node &> /dev/null || [[ $(node -v) != *"v22"* ]]; then
    echo "Installing Node.js 22..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 22
    nvm use 22
    nvm alias default 22
    echo "Node.js $(node -v) installed"
else
    echo "Node.js $(node -v) already installed"
fi

# Create application directory if it doesn't exist
APP_DIR="/home/ubuntu/copilot-metrics-dashboard"
if [ ! -d "$APP_DIR" ]; then
    echo "Creating application directory..."
    mkdir -p "$APP_DIR"
    # Clone repository if this is a first-time setup
    echo "Cloning repository..."
    git clone https://github.com/bukuwarung/github-copilot-metrics.git "$APP_DIR"
else
    echo "Application directory already exists"
    # Pull latest changes
    cd "$APP_DIR"
    git pull
fi

# Navigate to app directory and install dependencies
cd "$APP_DIR"
echo "Installing dependencies..."
npm install

# Clean up node_modules cache to free memory before build
echo "Cleaning npm cache to free memory..."
npm cache clean --force

# Build the application with memory-optimized settings
echo "Building application for low-memory environment..."
npm run build:ubuntu

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start or restart the application with PM2
if pm2 list | grep -q "copilot-dashboard"; then
    echo "Restarting application with PM2..."
    pm2 reload copilot-dashboard
else
    echo "Starting application with PM2..."
    pm2 start ecosystem.config.js
    # Configure PM2 to start on system boot
    pm2 startup
    pm2 save
fi

# Allow traffic on port 3000
echo "Configuring firewall..."
sudo ufw allow 3000/tcp
sudo ufw --force enable

echo "Deployment completed successfully!"
echo "Application is running at http://localhost:3000"
echo "Make sure your ALB is configured to point to this instance on port 3000"