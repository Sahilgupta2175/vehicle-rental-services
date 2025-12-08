# 🚀 Complete Deployment Guide with CI/CD

## Overview

This guide walks you through deploying the Vehicle Rental Services application to AWS EC2 using:
- **GitHub Actions** - Continuous Integration & Deployment
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse Proxy
- **MongoDB** - Database

---

## 📋 Prerequisites

### GitHub
- GitHub repository (already set up: `kushagra790/vehicle-rental-services`)
- GitHub Secrets configured for deployment

### AWS
- AWS EC2 instance (Amazon Linux 2 or Ubuntu)
- AWS IAM credentials (for optional ECR)
- Security groups configured (ports 80, 443, 22)
- Elastic IP (recommended)

### Local
- Git installed
- Docker installed (for testing locally)

---

## 🔐 Step 1: Configure GitHub Secrets

GitHub Secrets store sensitive credentials that GitHub Actions uses during deployment.

### Accessing GitHub Secrets

1. Go to your repository: `https://github.com/kushagra790/vehicle-rental-services`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Required Secrets to Add

Add the following secrets for CI/CD deployment:

```bash
# EC2 Connection
EC2_HOST              = your-ec2-public-ip (e.g., 3.14.159.26)
EC2_USER              = ec2-user or ubuntu
EC2_SSH_KEY           = (your EC2 private key - contents of your .pem file)

# Database
MONGODB_URI           = mongodb+srv://user:pass@cluster.mongodb.net/db?authSource=admin
MONGO_USER            = admin
MONGO_PASSWORD        = your-secure-password

# Authentication
JWT_SECRET            = your-very-secure-jwt-secret-key-min-32-chars

# API Keys
GEMINI_API_KEY        = your-gemini-api-key
TWILIO_ACCOUNT_SID    = your-twilio-sid
TWILIO_AUTH_TOKEN     = your-twilio-token
TWILIO_PHONE_NUMBER   = +1234567890
STRIPE_SECRET         = sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET = whsec_your-webhook-secret
RAZORPAY_KEY          = your-razorpay-key
RAZORPAY_SECRET       = your-razorpay-secret
SENDGRID_API_KEY      = your-sendgrid-key

# Cloudinary
CLD_NAME              = your-cloudinary-name
CLD_KEY               = your-cloudinary-key
CLD_SECRET            = your-cloudinary-secret

# Client URLs
CLIENT_URL            = http://your-ec2-ip (for CORS)
VITE_API_URL          = http://your-ec2-ip/api
VITE_SOCKET_URL       = http://your-ec2-ip
VITE_CHATBOT_API_URL  = http://your-ec2-ip/chatbot
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_your-stripe-key
VITE_RAZORPAY_KEY_ID       = your-razorpay-key-id

# Optional: Slack notifications
SLACK_WEBHOOK         = https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Getting Your EC2 SSH Key

Your EC2 SSH key is the `.pem` file you downloaded when creating the key pair.

```bash
# Read the contents of your .pem file
cat /path/to/your-key.pem

# Copy the entire contents and paste into EC2_SSH_KEY secret
# Include the BEGIN and END lines
```

---

## 🔧 Step 2: Setup AWS EC2 Instance

### Launch EC2 Instance

1. **Go to AWS Console** → **EC2** → **Instances** → **Launch Instances**

2. **Choose AMI**: Amazon Linux 2 or Ubuntu 20.04+

3. **Instance Type**: `t3.medium` (minimum for production)
   - `t3.large` recommended for better performance

4. **Network Settings**:
   - VPC: Default or your VPC
   - Auto-assign Public IP: Enable
   - Security Group: Create new or use existing
     - **Inbound Rules**:
       - Port 22 (SSH) - Source: Your IP
       - Port 80 (HTTP) - Source: 0.0.0.0/0
       - Port 443 (HTTPS) - Source: 0.0.0.0/0

5. **Storage**: 30GB minimum (gp3 recommended)

6. **Key Pair**: 
   - Create new or select existing
   - Download the `.pem` file (keep it safe!)
   - Set permissions: `chmod 400 your-key.pem`

### Connect to EC2 Instance

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Or for Ubuntu
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

---

## 📦 Step 3: Initial EC2 Setup (First Time Only)

Run the automated setup script on your EC2 instance:

```bash
# SSH into your EC2 instance first
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Clone the repository
git clone https://github.com/kushagra790/vehicle-rental-services.git
cd vehicle-rental-services

# Run setup script
chmod +x scripts/setup-ec2.sh
./scripts/setup-ec2.sh
```

The script will:
- Install Docker & Docker Compose
- Create necessary directories
- Setup systemd service
- Generate `.env.template`

### What the Script Does

✅ Updates system packages
✅ Installs Docker & Docker Compose
✅ Creates project directories
✅ Installs MongoDB tools for backups
✅ Installs CloudWatch agent for monitoring
✅ Sets up log rotation
✅ Creates systemd service for auto-restart

---

## 🔑 Step 4: Configure Environment Variables

### Create .env File on EC2

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Navigate to project
cd ~/vehicle-rental-services

# Copy template
cp .env.template .env

# Edit with your values
nano .env
```

### Important Security Notes

⚠️ **NEVER commit .env to GitHub**
- `.env` is in `.gitignore`
- Each environment has its own `.env` file
- Values are managed through:
  - GitHub Secrets (for CI/CD)
  - EC2 `.env` file (for runtime)

### What Goes in .env on EC2

```bash
NODE_ENV=production
PORT=8080
CLIENT_URL=http://your-ec2-public-ip

# Database - Use MongoDB Atlas or managed service
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vehicle-rental?authSource=admin

# Generated/secret values
JWT_SECRET=change-this-to-very-secure-32-char-secret
GEMINI_API_KEY=your-actual-api-key

# ... (all other values from template)
```

---

## 🚀 Step 5: Deploy Application

### Manual Deployment (Testing)

```bash
# On EC2 instance
cd ~/vehicle-rental-services

# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Automatic Deployment via GitHub Actions

```bash
# On your local machine
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will:
1. ✅ Build Docker images
2. ✅ Run tests
3. ✅ Push images to registry
4. ✅ SSH into EC2
5. ✅ Pull latest code
6. ✅ Deploy with Docker Compose
7. ✅ Verify services are healthy

### Monitoring Deployment

Check GitHub Actions:
1. Go to your repository
2. Click **Actions**
3. Watch the workflow run
4. Check logs in real-time

---

## 📊 Step 6: Verify Deployment

### Check Services

```bash
# On EC2 instance
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                    STATUS
# vehicle-rental-client   Up (healthy)
# vehicle-rental-server   Up (healthy)
# vehicle-rental-chatbot  Up (healthy)
# vehicle-rental-mongodb  Up (healthy)
# vehicle-rental-nginx    Up (healthy)
```

### Check Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f server

# View last 50 lines
docker-compose -f docker-compose.prod.yml logs --tail=50 nginx
```

### Test API

```bash
# From your local machine
curl http://your-ec2-public-ip/api/health

# Expected response:
# {"success":true,"status":"ok","timestamp":"2025-12-08T...","uptime":123.45}
```

### Access Application

- **Frontend**: `http://your-ec2-public-ip`
- **API**: `http://your-ec2-public-ip/api`
- **Chatbot**: `http://your-ec2-public-ip/chatbot`

---

## 🔄 Step 7: Continuous Deployment

### How CI/CD Pipeline Works

```
1. Push code to main branch
   ↓
2. GitHub Actions triggered
   ├─ Build Docker images
   ├─ Run tests
   └─ Push images to registry
   ↓
3. SSH into EC2 instance
   ├─ Pull latest code
   ├─ Load .env from EC2
   ├─ Stop old containers
   ├─ Pull new images
   ├─ Start new containers
   └─ Verify health
   ↓
4. Application updated!
```

### Update Application

```bash
# Make code changes
git add .
git commit -m "Your message"
git push origin main

# GitHub Actions automatically deploys!
# Check progress: GitHub > Actions
```

---

## 🔒 Security Best Practices

### .env Management

✅ **DO:**
- Store secrets in GitHub Secrets
- Load .env from filesystem on EC2
- Rotate secrets regularly
- Use strong JWT secrets (32+ characters)

❌ **DON'T:**
- Commit .env to GitHub
- Use same secrets across environments
- Share secrets in Slack/email
- Hardcode API keys in code

### File Permissions

```bash
# .env should be readable only by app
chmod 600 .env

# SSL certificates should be readable only
chmod 600 /path/to/ssl/*
```

### Secrets Rotation

```bash
# Update a secret
1. Update in GitHub Secrets
2. Update in EC2 .env
3. Redeploy: git push origin main
```

---

## 🛠 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs server

# Common issues:
# 1. .env file missing - Create it
# 2. Port conflict - Check: netstat -tlnp
# 3. Database connection - Verify MONGODB_URI

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Deployment Failed

```bash
# Check GitHub Actions logs
# Repository → Actions → Click failed workflow → Click job

# Common causes:
# 1. Invalid EC2 credentials
# 2. Wrong SSH key
# 3. .env file format error
# 4. Insufficient EC2 resources
```

### Cannot Connect to Application

```bash
# Check Nginx logs
docker logs vehicle-rental-nginx

# Check if port is open
telnet your-ec2-ip 80

# Check security groups
# AWS Console → EC2 → Security Groups
# Verify inbound rules for ports 80, 443
```

---

## 📈 Monitoring & Maintenance

### View Application Logs

```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f server

# Search for errors
docker-compose -f docker-compose.prod.yml logs server | grep ERROR

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 server
```

### Database Backup

```bash
# Manual backup
docker exec vehicle-rental-mongodb mongodump --out /backups/$(date +%Y%m%d)

# List backups
ls -la /backups/
```

### Stop & Restart Services

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Restart specific service
docker-compose -f docker-compose.prod.yml restart server
```

### Clean Up

```bash
# Remove old containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f
```

---

## 🆘 Support & Resources

### Check Status

```bash
# All services
docker-compose -f docker-compose.prod.yml ps

# Specific service health
curl -f http://localhost/api/health
```

### Useful Commands

```bash
# Deploy script location
~/vehicle-rental-services/scripts/deploy.sh

# Docker Compose file
~/vehicle-rental-services/docker-compose.prod.yml

# Environment file
~/vehicle-rental-services/.env

# Nginx config
~/vehicle-rental-services/nginx.prod.conf

# Logs location
/var/log/app/
```

### GitHub Actions

- **Workflow file**: `.github/workflows/deploy.yml`
- **Check status**: GitHub → Actions
- **View logs**: Click workflow → Click job → Expand steps

---

## ✅ Deployment Checklist

Before going live:

- [ ] GitHub Secrets configured
- [ ] EC2 instance created & secured
- [ ] SSH key saved locally
- [ ] Initial setup script run
- [ ] .env file created on EC2
- [ ] All environment variables filled
- [ ] First manual deployment successful
- [ ] API responding at `/api/health`
- [ ] Application accessible in browser
- [ ] CI/CD pipeline tested
- [ ] Database backups working
- [ ] Monitoring enabled
- [ ] Domain pointing to EC2 (optional)
- [ ] SSL certificate installed (recommended)

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)

---

**Last Updated**: December 8, 2025
**Status**: Production Ready ✅
