# Git Configuration Guide

## Overview
This document ensures all sensitive files are properly ignored and your project is ready for GitHub and deployment.

## .gitignore Files

### Root Level (.gitignore)
- ✅ Environment variables (.env, .env.production, etc.)
- ✅ SSL/TLS certificates
- ✅ Docker compose overrides
- ✅ Dependencies (node_modules, venv, __pycache__)
- ✅ Build outputs (dist, build)
- ✅ IDE settings (.vscode, .idea)
- ✅ OS files (.DS_Store, Thumbs.db)
- ✅ Logs and temporary files
- ✅ Uploads directory

### Server (.gitignore)
- ✅ .env files
- ✅ node_modules
- ✅ npm logs
- ✅ uploads/ directory
- ✅ IDE files

### Client (.gitignore)
- ✅ .env files
- ✅ node_modules
- ✅ dist/ (build output)
- ✅ IDE files
- ✅ npm logs

### Chatbot (.gitignore)
- ✅ .env file
- ✅ Python cache (__pycache__)
- ✅ Virtual environments (venv)
- ✅ IDE files
- ✅ Log files

## Environment Files (.env)

### Files That SHOULD NOT Be Committed
```
✋ NEVER commit:
- .env (local development)
- .env.production (production secrets)
- .env.development
- .env.local
- .env.*.local
```

### Current .env Files Location
```
✅ server/.env          (configured)
✅ client/.env          (configured)
✅ chatbot/.env         (configured)
```

### What's Inside Your .env Files

#### server/.env
- MONGO_URI (database connection)
- JWT_SECRET (authentication)
- API keys (Stripe, Twilio, etc.)
- SMTP credentials
- Cloudinary secrets

#### client/.env
- VITE_API_URL (backend API URL)
- VITE_STRIPE_PUBLISHABLE_KEY
- VITE_RAZORPAY_KEY_ID
- VITE_SOCKET_URL
- VITE_CHATBOT_API_URL

#### chatbot/.env
- GEMINI_API_KEY (AI service)

## GitHub Safety Checklist

Before pushing to GitHub, verify:

```bash
# Check what will be committed (should NOT include .env files)
git status

# See what files are ignored
git check-ignore -v *

# Stage files
git add .

# Before commit, verify
git status  # Should NOT show .env files

# Commit
git commit -m "Your message"

# Push
git push origin main
```

## Security Best Practices

### ✅ DO Commit:
- Source code (.js, .jsx, .py)
- Configuration files (docker-compose.yml, nginx.conf)
- Dockerfiles
- Documentation (README.md)
- .gitignore itself
- Package files (package.json, requirements.txt)

### ❌ NEVER Commit:
- .env files
- API keys and secrets
- Database passwords
- JWT secrets
- SSL/TLS certificates
- Private credentials
- node_modules/
- __pycache__/
- Build artifacts

## If You Accidentally Committed Secrets

If you accidentally pushed a `.env` file, immediately:

```bash
# Remove from git history (remove file from all commits)
git filter-branch --tree-filter 'rm -f .env' HEAD

# Force push (WARNING: affects all collaborators)
git push origin main --force

# Rotate all exposed secrets immediately
```

## Production Deployment

When deploying to AWS EC2:

```bash
# Create .env on EC2 server (never from GitHub)
ssh -i key.pem ec2-user@ip-address

# Create environment file
nano .env

# Add your production secrets manually
NODE_ENV=production
MONGO_URI=...
JWT_SECRET=...
# etc.

# Then deploy with Docker
docker-compose up -d --build
```

## Verify Ignore is Working

```bash
# This should return empty (no .env files should be tracked)
git ls-files | grep "\.env"

# This should show your .env files (meaning they're ignored)
git check-ignore -v .env server/.env client/.env chatbot/.env
```

## Status Summary

| File | Status | Ignored | Location |
|------|--------|---------|----------|
| Root .gitignore | ✅ Created | - | `root/.gitignore` |
| Server .gitignore | ✅ Updated | - | `server/.gitignore` |
| Client .gitignore | ✅ Updated | - | `client/.gitignore` |
| Chatbot .gitignore | ✅ Created | - | `chatbot/.gitignore` |
| server/.env | ✅ Exists | ✅ Ignored | `server/.env` |
| client/.env | ✅ Exists | ✅ Ignored | `client/.env` |
| chatbot/.env | ✅ Exists | ✅ Ignored | `chatbot/.env` |

---

**You're all set! Your project is now secure for GitHub.** 🔒
