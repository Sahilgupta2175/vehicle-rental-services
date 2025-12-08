# GitHub Actions Secrets Configuration
# 
# This file lists all secrets you need to add to GitHub for CI/CD deployment
# 
# Instructions:
# 1. Go to https://github.com/kushagra790/vehicle-rental-services
# 2. Click Settings → Secrets and variables → Actions
# 3. Click "New repository secret"
# 4. Add each secret below with the name and value

# ============================================================
# EC2 CONNECTION SECRETS
# ============================================================

# Your EC2 instance public IP
# Example: 3.14.159.26
EC2_HOST=your-ec2-public-ip-here

# EC2 login user
# Default: ec2-user (for Amazon Linux 2)
# For Ubuntu: ubuntu
EC2_USER=ec2-user

# EC2 SSH private key
# Copy entire contents of your .pem file
# Including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----
EC2_SSH_KEY=-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----

# ============================================================
# DATABASE SECRETS
# ============================================================

# MongoDB connection string
# Using MongoDB Atlas or self-hosted
# Format: mongodb+srv://user:password@cluster.mongodb.net/database?authSource=admin
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vehicle-rental?authSource=admin

# MongoDB admin username
MONGO_USER=admin

# MongoDB admin password
MONGO_PASSWORD=very-secure-password

# ============================================================
# AUTHENTICATION SECRETS
# ============================================================

# JWT Secret for token signing
# Should be at least 32 characters
# Generate: openssl rand -base64 32
JWT_SECRET=your-32-char-secret-key-generated-with-openssl-rand

# ============================================================
# AI & CHATBOT SECRETS
# ============================================================

# Google Generative AI (Gemini) API Key
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key

# ============================================================
# COMMUNICATION SERVICES
# ============================================================

# Twilio Account SID
# Get from: https://www.twilio.com/console
TWILIO_ACCOUNT_SID=AC1234567890abcdef

# Twilio Auth Token
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Twilio Phone Number for SMS
# Format: +1234567890
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid API Key for email
# Get from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# ============================================================
# PAYMENT SERVICES
# ============================================================

# Stripe Secret Key
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET=sk_test_your-stripe-secret-key

# Stripe Webhook Secret
# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Razorpay Key ID
# Get from: https://dashboard.razorpay.com/#/app/keys
RAZORPAY_KEY=rzp_test_your-razorpay-key

# Razorpay Secret
RAZORPAY_SECRET=your-razorpay-secret

# ============================================================
# MEDIA SERVICES
# ============================================================

# Cloudinary Account Name
# Get from: https://cloudinary.com/console
CLD_NAME=your-cloudinary-name

# Cloudinary API Key
CLD_KEY=your-cloudinary-api-key

# Cloudinary API Secret
CLD_SECRET=your-cloudinary-api-secret

# ============================================================
# CLIENT CONFIGURATION
# ============================================================

# Client URL for CORS (use EC2 public IP or domain)
# Example: http://3.14.159.26 or https://yourdomain.com
CLIENT_URL=http://your-ec2-public-ip

# Frontend API URL
# Should point to /api endpoint
VITE_API_URL=http://your-ec2-public-ip/api

# Frontend Socket URL for real-time updates
VITE_SOCKET_URL=http://your-ec2-public-ip

# Frontend Chatbot API URL
VITE_CHATBOT_API_URL=http://your-ec2-public-ip/chatbot

# Stripe Publishable Key for frontend
# Get from: https://dashboard.stripe.com/apikeys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Razorpay Key ID for frontend
VITE_RAZORPAY_KEY_ID=rzp_test_your-razorpay-key-id

# ============================================================
# OPTIONAL: NOTIFICATIONS
# ============================================================

# Slack Webhook for deployment notifications
# Get from: https://api.slack.com/apps
# Example: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# ============================================================
# NOTES
# ============================================================
# 
# 1. All values are sensitive - never share them
# 2. Rotate secrets regularly (monthly recommended)
# 3. Use different values for dev/prod environments
# 4. Keep .pem file secure locally
# 5. Don't commit these values to Git
# 
# To add a secret:
# 1. Go to Settings → Secrets and variables → Actions
# 2. Click "New repository secret"
# 3. Enter name and value
# 4. Click "Add secret"
#
# The CI/CD pipeline will use these secrets during deployment
