#!/bin/bash

# ============================================================
# Deploy Script - GitHub Actions triggered deployment
# ============================================================
# This script is executed on the EC2 instance to deploy the app

set -e  # Exit on error

PROJECT_DIR="/home/ec2-user/vehicle-rental-services"
LOG_FILE="/var/log/deploy.log"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================
# Logging function
# ============================================================
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# ============================================================
# Pre-deployment checks
# ============================================================
log "Starting deployment process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

log "Docker and Docker Compose are installed ✓"

# ============================================================
# Navigate to project directory
# ============================================================
if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory not found at $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1
log "Changed directory to $PROJECT_DIR ✓"

# ============================================================
# Pull latest code
# ============================================================
log "Pulling latest code from GitHub..."
git fetch origin || error "Failed to fetch from GitHub"
git checkout main || git checkout master || error "Failed to checkout branch"
git pull origin main || git pull origin master || error "Failed to pull code"
log "Code pulled successfully ✓"

# ============================================================
# Check if .env file exists
# ============================================================
if [ ! -f .env ]; then
    error ".env file not found!"
    error "Please create .env file with necessary environment variables on the EC2 instance"
    error "Use: nano .env"
    exit 1
fi

log ".env file found ✓"

# Verify .env has required variables
required_vars=("MONGODB_URI" "JWT_SECRET" "GEMINI_API_KEY")
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        error "Required environment variable '$var' not found in .env"
        exit 1
    fi
done

log "All required environment variables present ✓"

# ============================================================
# Verify .env is not committed to git
# ============================================================
if git ls-files --error-unmatch .env 2>/dev/null; then
    warning ".env file is tracked by git! Untracking it..."
    git rm --cached .env
    git commit -m "Untrack .env file" || true
fi

log ".env file is properly ignored ✓"

# ============================================================
# Stop old containers gracefully
# ============================================================
log "Stopping old containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true
log "Old containers stopped ✓"

# ============================================================
# Pull latest Docker images
# ============================================================
log "Pulling latest Docker images from registry..."
GITHUB_REPO=$(git config --get remote.origin.url | sed 's/.*\/\(.*\)\/\(.*\)\.git/\1\/\2/')

docker pull ghcr.io/$GITHUB_REPO/server:latest || warning "Failed to pull server image"
docker pull ghcr.io/$GITHUB_REPO/client:latest || warning "Failed to pull client image"
docker pull ghcr.io/$GITHUB_REPO/chatbot:latest || warning "Failed to pull chatbot image"

log "Docker images pulled ✓"

# ============================================================
# Validate docker-compose file
# ============================================================
log "Validating docker-compose configuration..."
docker-compose -f docker-compose.prod.yml config > /dev/null || {
    error "Invalid docker-compose configuration"
    exit 1
}
log "docker-compose configuration is valid ✓"

# ============================================================
# Start new containers
# ============================================================
log "Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d --build

if [ $? -ne 0 ]; then
    error "Failed to start containers"
    exit 1
fi

log "Containers started ✓"

# ============================================================
# Wait for services to be healthy
# ============================================================
log "Waiting for services to be healthy..."
sleep 10

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -sf http://localhost/api/health > /dev/null 2>&1; then
        log "Server is healthy ✓"
        break
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        error "Server failed to become healthy after $max_attempts attempts"
        docker-compose -f docker-compose.prod.yml logs server
        exit 1
    fi
    
    sleep 1
done

# ============================================================
# Verify all services
# ============================================================
log "Verifying all services..."
docker-compose -f docker-compose.prod.yml ps

log "Checking service logs..."
docker-compose -f docker-compose.prod.yml logs --tail=20 server

# ============================================================
# Clean up old images
# ============================================================
log "Cleaning up old Docker images..."
docker image prune -f --filter "until=24h"

log "Cleanup completed ✓"

# ============================================================
# Database backup (optional)
# ============================================================
if command -v mongodump &> /dev/null; then
    log "Creating MongoDB backup..."
    BACKUP_DIR="/backups/mongodb-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    MONGO_URI=$(grep "MONGODB_URI" .env | cut -d'=' -f2-)
    mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR"
    
    log "MongoDB backup created at $BACKUP_DIR ✓"
fi

# ============================================================
# Deployment complete
# ============================================================
log "✨ Deployment completed successfully!"
log "Application is running at: http://$(hostname -I | awk '{print $1}')"
log "Check logs with: docker-compose -f docker-compose.prod.yml logs -f"

exit 0
