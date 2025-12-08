# 🏗️ AWS EC2 Deployment Guide

## Quick Reference

| Component | Configuration |
|-----------|---------------|
| **OS** | Amazon Linux 2 or Ubuntu 20.04+ |
| **Instance Type** | t3.medium (minimum) |
| **Storage** | 30GB GP3 |
| **CPU** | 2 vCPU |
| **Memory** | 4GB RAM |
| **Ports** | 22 (SSH), 80 (HTTP), 443 (HTTPS) |

---

## 📋 Step-by-Step AWS EC2 Setup

### 1️⃣ Launch EC2 Instance

**Go to AWS Console:**
```
aws.amazon.com → Console → EC2
```

**Click "Launch Instances":**

1. **Name and Tags**
   - Name: `vehicle-rental-services`

2. **AMI Selection**
   - Search: "Amazon Linux 2 AMI"
   - Click: Newest Amazon Linux 2 AMI
   - Or: Ubuntu Server 20.04 LTS

3. **Instance Type**
   - Select: `t3.medium`
   - (t3.large for production)

4. **Key Pair**
   - Create new key pair
   - Name: `vehicle-rental-key`
   - Type: RSA
   - Format: .pem
   - **SAVE SECURELY** (don't lose this!)

5. **Network Settings**
   - VPC: Default
   - Subnet: Default
   - Auto-assign Public IP: Enable
   
   **Security Group** (Create new):
   - Name: `vehicle-rental-sg`
   - Description: "Security group for Vehicle Rental app"
   
   **Inbound Rules:**
   ```
   Type      | Protocol | Port | Source
   ----------+----------+------+------------------
   SSH       | TCP      | 22   | 0.0.0.0/0 (or your IP)
   HTTP      | TCP      | 80   | 0.0.0.0/0
   HTTPS     | TCP      | 443  | 0.0.0.0/0
   ```

6. **Storage**
   - Size: 30 GiB (minimum)
   - Type: gp3 (General Purpose SSD)
   - IOPS: 3000
   - Throughput: 125 MB/s

7. **Review and Launch**
   - Click: "Launch Instance"

### ✅ Wait for Instance to Start

Once running, note:
- **Instance ID**: `i-0123456789abcdef`
- **Public IP**: `3.14.159.26`
- **Public DNS**: `ec2-3-14-159-26.compute-1.amazonaws.com`

---

### 2️⃣ Connect to EC2

**From Terminal/PowerShell:**

```bash
# Set key permissions (Linux/Mac)
chmod 400 /path/to/vehicle-rental-key.pem

# SSH into instance
ssh -i /path/to/vehicle-rental-key.pem ec2-user@3.14.159.26

# For Ubuntu, use 'ubuntu' instead of 'ec2-user'
ssh -i /path/to/vehicle-rental-key.pem ubuntu@3.14.159.26
```

**Using Windows PowerShell:**

```powershell
# Or use PuTTY/MobaXterm for GUI
# Convert .pem to .ppk for PuTTY using PuTTYgen
```

Once connected:
```bash
# You should see:
[ec2-user@ip-172-31-xx-xx ~]$
```

---

### 3️⃣ Run Initial Setup

Once SSH'ed into EC2:

```bash
# Create project directory
mkdir -p ~/vehicle-rental-services
cd ~/vehicle-rental-services

# Clone repository
git clone https://github.com/kushagra790/vehicle-rental-services.git .

# Run setup script
chmod +x scripts/setup-ec2.sh
./scripts/setup-ec2.sh
```

**What this does:**
- Updates system
- Installs Docker & Docker Compose
- Creates necessary directories
- Sets up systemd service
- Installs monitoring tools

**Reconnect after setup:**
```bash
# Exit SSH
exit

# Reconnect to apply Docker group changes
ssh -i vehicle-rental-key.pem ec2-user@3.14.159.26
```

---

### 4️⃣ Configure Environment

**Create .env file:**

```bash
# Copy template
cp .env.template .env

# Edit with nano
nano .env

# Or use your preferred editor
vim .env
```

**Paste your configuration:**

```bash
# Copy from GITHUB_SECRETS_TEMPLATE.md
NODE_ENV=production
PORT=8080
CLIENT_URL=http://3.14.159.26
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-key
... (all other values)
```

**Save (nano):**
- Press: `Ctrl + O`
- Press: `Enter`
- Press: `Ctrl + X`

**Verify:**
```bash
cat .env | head -20
```

---

### 5️⃣ Deploy Application

**Option A: Manual Deployment**

```bash
cd ~/vehicle-rental-services
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Option B: Automatic via GitHub (Recommended)**

```bash
# From your local machine
git add .
git commit -m "Deploy to production"
git push origin main

# Watch deployment:
# GitHub → Actions → Click latest workflow
```

**Monitor deployment:**

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Wait for "healthy" status
```

---

### 6️⃣ Verify Deployment

**Test connectivity:**

```bash
# From local machine
curl http://3.14.159.26/api/health

# Expected response:
# {"success":true,"status":"ok",...}
```

**Check services:**

```bash
# SSH to EC2
ssh -i vehicle-rental-key.pem ec2-user@3.14.159.26

# List containers
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                    STATUS
# vehicle-rental-client   Up (healthy)
# vehicle-rental-server   Up (healthy)
# vehicle-rental-chatbot  Up (healthy)
# vehicle-rental-mongodb  Up (healthy)
# vehicle-rental-nginx    Up (healthy)
```

**Access application:**

- Frontend: `http://3.14.159.26`
- API: `http://3.14.159.26/api`
- Chatbot: `http://3.14.159.26/chatbot`

---

## 🔐 Security Hardening

### Restrict SSH Access

```bash
# Update security group in AWS Console
# Edit inbound rule:
SSH Rule:
  Port: 22
  Source: 1.2.3.4/32  (your IP only, not 0.0.0.0/0)
```

### Setup SSL/TLS (HTTPS)

**Option A: AWS Certificate Manager (Free)**

1. Go to AWS Console → ACM (Certificate Manager)
2. Request certificate for your domain
3. Verify domain ownership
4. Configure in Nginx

**Option B: Let's Encrypt (Free)**

```bash
# SSH to EC2
ssh -i vehicle-rental-key.pem ec2-user@3.14.159.26

# Install Certbot
sudo yum install certbot python-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx (uncomment HTTPS section in nginx.prod.conf)
# Restart: docker-compose -f docker-compose.prod.yml restart nginx
```

### Enable Firewall

```bash
# SSH to EC2
# Amazon Linux 2 doesn't have iptables enabled by default
# Use AWS Security Groups (recommended)
```

---

## 📊 Monitoring & Scaling

### CloudWatch Monitoring

```bash
# Already installed by setup script
# Monitor in AWS Console:
# CloudWatch → Dashboards → Create dashboard

# Add metrics for:
# - CPU utilization
# - Memory utilization
# - Disk space
# - Network traffic
```

### Auto-Scaling

For production, consider:

1. **Auto Scaling Group**
   - Launch template from your instance
   - Min: 2, Desired: 2, Max: 5
   - Monitors CPU and scales up/down

2. **Load Balancer**
   - Elastic Load Balancer
   - Distributes traffic
   - Health checks

3. **RDS Database** (optional)
   - Managed MongoDB service
   - Automatic backups
   - Multi-AZ for redundancy

---

## 🔄 Updating Application

### Via GitHub Actions (Automatic)

```bash
# On your local machine
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions automatically:
# 1. Builds new images
# 2. Tests code
# 3. Deploys to EC2
# 4. Updates containers
```

### Manual Update on EC2

```bash
# SSH to EC2
ssh -i vehicle-rental-key.pem ec2-user@3.14.159.26

# Pull latest code
cd ~/vehicle-rental-services
git pull origin main

# Update .env if needed
nano .env

# Redeploy
./scripts/deploy.sh
```

---

## 🗑️ Cost Optimization

### Reduce Costs

1. **Choose Appropriate Instance Type**
   - Development: t3.micro (~$7/month)
   - Staging: t3.small (~$15/month)
   - Production: t3.medium (~$30/month)

2. **Use Reserved Instances** (30-40% discount)
   - 1-year or 3-year terms
   - Predictable workload

3. **Stop When Not Needed**
   - Development instances off-hours
   - Saves 50% of compute costs

4. **Monitor Costs**
   - AWS Cost Explorer
   - Budget alerts

### Estimate Monthly Cost

```
EC2 t3.medium:        $30
Data transfer:        $5-10
MongoDB Atlas:        $0-50
Estimated monthly:    $35-90

With reserved:        $20-60
```

---

## 🆘 Troubleshooting

### SSH Connection Failed

```bash
# Check security group
AWS Console → EC2 → Security Groups
Verify inbound rule for port 22

# Check key permissions (Linux/Mac)
chmod 400 your-key.pem

# Check DNS/IP
ping ec2-3-14-159-26.compute-1.amazonaws.com
```

### Insufficient Disk Space

```bash
# Check disk usage
df -h

# Free up space
docker system prune -a
rm -rf /backups/old/*
```

### High CPU Usage

```bash
# Check which process
top
docker stats

# Restart containers
docker-compose -f docker-compose.prod.yml restart

# Scale up instance type
# Stop instance → Change type → Start
```

### Database Connection Issues

```bash
# Verify MONGODB_URI in .env
cat .env | grep MONGODB_URI

# Test connection
docker exec vehicle-rental-mongodb mongosh

# Check logs
docker logs vehicle-rental-server | grep -i mongo
```

---

## 📋 EC2 Maintenance Checklist

### Weekly
- [ ] Check disk space: `df -h`
- [ ] Review logs: `docker logs vehicle-rental-server`
- [ ] Verify all services: `docker-compose ps`

### Monthly
- [ ] Update system: `sudo yum update -y`
- [ ] Backup database: `./scripts/backup-mongo.sh`
- [ ] Review security groups
- [ ] Check CloudWatch metrics

### Quarterly
- [ ] Rotate secrets
- [ ] Update Docker images
- [ ] Review costs
- [ ] Test failover/recovery

---

## 📞 AWS Support

### Free Support
- AWS Documentation
- AWS Forums
- Stack Overflow

### Paid Support
- Basic: $29/month
- Developer: $29+/month
- Business: $100+/month
- Enterprise: $15,000+/month

---

## 🎓 Learning Resources

- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [Docker in EC2](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html)
- [AWS Pricing Calculator](https://calculator.aws/)

---

## ✅ Setup Complete!

Your application is now running on AWS EC2 with:

✅ Automated CI/CD deployment
✅ Docker containerization
✅ Secure .env management
✅ Health monitoring
✅ Automatic scaling ready
✅ Production-grade infrastructure

**Access your app at:** `http://your-ec2-public-ip`

---

**Last Updated:** December 8, 2025
**Status:** ✅ Production Ready
