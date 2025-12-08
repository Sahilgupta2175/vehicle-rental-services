# 🚗 Vehicle Rental Services

A comprehensive full-stack vehicle rental management system built with React, Node.js, Python, MongoDB, and Docker.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [AWS EC2 Deployment](#aws-ec2-deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## ✨ Features

### User Features
- 🔐 User authentication & authorization
- 🚗 Browse available vehicles
- 📅 Book vehicles with date range
- 💳 Payment integration (Stripe, Razorpay)
- 📊 Booking history & management
- 💬 AI chatbot for support

### Vendor Features
- 📝 Add and manage vehicles
- 📈 View bookings and analytics
- 💰 Revenue tracking
- 🎯 Vehicle pricing management

### Admin Features
- 👥 User management
- 🚘 Vehicle approval & management
- 📊 Analytics & reports
- 💰 Financial reports
- 📧 Email notifications

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Stripe/Razorpay** - Payment processing

### Chatbot
- **Python 3.11** - Runtime
- **FastAPI** - Web framework
- **Google Generative AI** - AI engine

### Deployment
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **AWS EC2** - Cloud hosting

## 📁 Project Structure

```
vehicle-rental-services/
├── client/                  # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── server/                  # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── package.json
│   ├── Dockerfile
│   ├── server.js
│   └── .env.example
│
├── chatbot/                 # Python chatbot
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml       # Docker orchestration
├── nginx.conf              # Nginx configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB
- Git

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/kushagra790/vehicle-rental-services.git
cd vehicle-rental-services

# Setup Server
cd server
cp .env.example .env
npm install
npm start

# Setup Client (in new terminal)
cd client
cp .env.example .env
npm install
npm run dev

# Setup Chatbot (in new terminal)
cd chatbot
cp .env.example .env
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📝 Environment Variables

### Server (.env)
See `server/.env.example` for template. Key variables:
```bash
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
STRIPE_SECRET=sk_test_...
GEMINI_API_KEY=...
```

### Client (.env)
See `client/.env.example` for template. Key variables:
```bash
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_CHATBOT_API_URL=http://localhost:8000
```

### Chatbot (.env)
See `chatbot/.env.example` for template. Key variables:
```bash
GEMINI_API_KEY=...
```

⚠️ **Important**: Never commit actual `.env` files. Use `.env.example` as template.

## 🚀 Running Locally

### Option 1: Direct Development

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev

# Terminal 3: Chatbot
cd chatbot
uvicorn main:app --reload
```

Access the app at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080/api
- Chatbot: http://localhost:8000

### Option 2: Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🐳 Docker Deployment

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build server
```

### Run with Docker

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f server
```

## ☁️ AWS EC2 Deployment

### 1. Launch EC2 Instance
- AMI: Amazon Linux 2 or Ubuntu
- Instance Type: t3.medium or higher
- Security Groups: Open ports 80, 443, 22

### 2. SSH into Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

### 3. Install Docker & Docker Compose

```bash
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Clone & Deploy

```bash
git clone https://github.com/kushagra790/vehicle-rental-services.git
cd vehicle-rental-services

# Create .env file
nano .env
# Add your production environment variables

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d --build
```

### 5. Access Application

- Frontend: http://your-ec2-public-ip
- API: http://your-ec2-public-ip/api
- Chatbot: http://your-ec2-public-ip/chatbot

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/register      # Register new user
POST /api/auth/login         # Login user
GET  /api/auth/me            # Get current user
```

### Vehicles
```bash
GET  /api/vehicles           # Get all vehicles
POST /api/vehicles           # Create vehicle (vendor)
PUT  /api/vehicles/:id       # Update vehicle
DELETE /api/vehicles/:id     # Delete vehicle
```

### Bookings
```bash
GET  /api/bookings           # Get user bookings
POST /api/bookings           # Create booking
PUT  /api/bookings/:id       # Update booking
DELETE /api/bookings/:id     # Cancel booking
```

### Payments
```bash
POST /api/payments/create-order   # Create payment order
POST /api/payments/verify         # Verify payment
```

## 🔒 Security

- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ JWT authentication
- ✅ Input validation & sanitization
- ✅ Environment variables for secrets
- ✅ HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For support, email support@vehiclerental.com or open an issue on GitHub.

## 👨‍💻 Author

**Kushagra** - [GitHub](https://github.com/kushagra790)

---

**Last Updated:** December 2025
