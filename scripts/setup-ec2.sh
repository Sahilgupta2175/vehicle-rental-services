#!/bin/bash

# ============================================================
# EC2 Setup Script - Initial instance configuration
# ============================================================
# Run this script on a fresh EC2 instance to set it up

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

log "Starting EC2 setup..."

# ============================================================
# Update system
# ============================================================
log "Updating system packages..."
sudo yum update -y
sudo yum install -y git curl wget

# ============================================================
# Install Docker
# ============================================================
log "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -a -G docker ec2-user
log "Docker installed ✓"

# ============================================================
# Install Docker Compose
# ============================================================
log "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
log "Docker Compose installed ✓"

# ============================================================
# Create deployment directories
# ============================================================
log "Creating deployment directories..."
mkdir -p /home/ec2-user/vehicle-rental-services
mkdir -p /var/log/app
mkdir -p /backups/mongodb
sudo chown -R ec2-user:ec2-user /home/ec2-user/vehicle-rental-services
sudo chown -R ec2-user:ec2-user /var/log/app
sudo chown -R ec2-user:ec2-user /backups/mongodb

# ============================================================
# Setup SSL directory
# ============================================================
log "Setting up SSL directory..."
mkdir -p /home/ec2-user/vehicle-rental-services/ssl
chmod 700 /home/ec2-user/vehicle-rental-services/ssl

# ============================================================
# Install MongoDB tools (optional but recommended)
# ============================================================
log "Installing MongoDB tools..."
sudo yum install -y mongodb-org-tools
log "MongoDB tools installed ✓"

# ============================================================
# Install CloudWatch agent (optional but recommended)
# ============================================================
log "Installing CloudWatch agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
rm amazon-cloudwatch-agent.rpm
log "CloudWatch agent installed ✓"

# ============================================================
# Setup log rotation
# ============================================================
log "Setting up log rotation..."
sudo tee /etc/logrotate.d/app > /dev/null <<EOF
/var/log/app/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ec2-user ec2-user
    sharedscripts
}
EOF

# ============================================================
# Create systemd service for Docker Compose
# ============================================================
log "Creating systemd service for Docker Compose..."
sudo tee /etc/systemd/system/vehicle-rental.service > /dev/null <<'EOF'
[Unit]
Description=Vehicle Rental Services
Requires=docker.service
After=docker.service
PartOf=docker.service

[Service]
Type=oneshot
WorkingDirectory=/home/ec2-user/vehicle-rental-services
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
log "Systemd service created ✓"

# ============================================================
# Create .env.template
# ============================================================
log "Creating .env template..."
cat > /home/ec2-user/vehicle-rental-services/.env.template << 'EOF'
# ============================================================
# Production Environment Variables
# ============================================================
# DO NOT COMMIT THIS FILE TO GIT!
# Copy this file to .env and fill in your actual values

NODE_ENV=production
PORT=8080

# ========== Client URL ==========
CLIENT_URL=http://your-ec2-public-ip

# ========== Database ==========
MONGO_USER=admin
MONGO_PASSWORD=change-this-to-secure-password
MONGODB_URI=mongodb://admin:change-this-to-secure-password@mongodb:27017/vehicle-rental?authSource=admin

# ========== Authentication ==========
JWT_SECRET=change-this-to-a-very-secure-secret-key-min-32-chars
JWT_EXPIRES=7d

# ========== Gemini AI ==========
GEMINI_API_KEY=your-gemini-api-key-here

# ========== Twilio ==========
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ========== Stripe ==========
STRIPE_SECRET=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# ========== Razorpay ==========
RAZORPAY_KEY=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret

# ========== SendGrid ==========
SENDGRID_API_KEY=your-sendgrid-api-key

# ========== Cloudinary ==========
CLD_NAME=your-cloudinary-name
CLD_KEY=your-cloudinary-key
CLD_SECRET=your-cloudinary-secret

# ========== Client Environment ==========
VITE_API_URL=http://your-ec2-public-ip/api
VITE_SOCKET_URL=http://your-ec2-public-ip
VITE_CHATBOT_API_URL=http://your-ec2-public-ip/chatbot
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
EOF

sudo chown ec2-user:ec2-user /home/ec2-user/vehicle-rental-services/.env.template
chmod 600 /home/ec2-user/vehicle-rental-services/.env.template

log ".env template created ✓"

# ============================================================
# Clone repository
# ============================================================
log "Cloning repository..."
cd /home/ec2-user/vehicle-rental-services
git clone https://github.com/kushagra790/vehicle-rental-services.git . || {
    warning "Repository may already exist, pulling latest..."
    git pull origin main || git pull origin master
}

# ============================================================
# Setup deployment script
# ============================================================
log "Setting up deployment script..."
chmod +x /home/ec2-user/vehicle-rental-services/scripts/deploy.sh

# ============================================================
# Configure SSH key for GitHub (if needed)
# ============================================================
log "SSH key setup instructions:"
echo -e "${YELLOW}If you're using SSH for git, run:${NC}"
echo "ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ''"
echo "cat ~/.ssh/id_ed25519.pub"
echo "Add the public key to GitHub Settings > SSH Keys"

# ============================================================
# Setup complete
# ============================================================
log "✨ EC2 setup completed successfully!"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Reconnect to EC2 (or run 'newgrp docker' in current session)"
echo "2. Create .env file: cp .env.template .env"
echo "3. Edit .env with your actual values: nano .env"
echo "4. Deploy: ./scripts/deploy.sh"
echo ""
echo "Useful commands:"
echo "  View logs:              docker-compose -f docker-compose.prod.yml logs -f"
echo "  Restart services:       docker-compose -f docker-compose.prod.yml restart"
echo "  Stop services:          docker-compose -f docker-compose.prod.yml down"
echo "  Check service status:   docker-compose -f docker-compose.prod.yml ps"

exit 0
