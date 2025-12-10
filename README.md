<div align="center">

# 🚗 Vehicle Rental Services Platform

### A Full-Stack Modern Vehicle Rental Management System

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About The Project

**Vehicle Rental Services** is a comprehensive, full-stack web application designed to streamline vehicle rental operations. Built with modern technologies, it provides a seamless experience for customers, vendors, and administrators to manage vehicle rentals efficiently.

### 🌟 Why This Project?

- **Multi-Role System**: Separate dashboards for Users, Vendors, and Admins
- **Real-time Updates**: Socket.IO integration for live notifications
- **Secure Payments**: Razorpay payment gateway integration
- **AI-Powered Chatbot**: Google Gemini-powered chatbot for customer support
- **Comprehensive Management**: End-to-end booking, payment, and reporting system

---

## ✨ Key Features

### 👥 User Management
- ✅ **Multi-role authentication** (User, Vendor, Admin)
- ✅ **JWT-based secure authentication**
- ✅ **Password reset functionality** with email verification
- ✅ **Profile management** with avatar uploads

### 🚙 Vehicle Management
- ✅ **Vehicle listing & search** with filters (type, price, location)
- ✅ **Detailed vehicle information** with image galleries
- ✅ **Vendor vehicle management** (add, edit, delete)
- ✅ **Availability tracking** with real-time updates
- ✅ **Image upload** with Cloudinary integration

### 📅 Booking System
- ✅ **Smart booking interface** with date/time picker
- ✅ **Real-time availability checking**
- ✅ **Booking history & tracking**
- ✅ **Automated booking confirmation** emails
- ✅ **Booking status management** (pending, confirmed, completed, cancelled)

### 💳 Payment Integration
- ✅ **Razorpay payment gateway**
- ✅ **Secure transaction processing**
- ✅ **Payment history & receipts**
- ✅ **Transaction tracking**
- ✅ **Refund management**

### 📊 Dashboard & Analytics
- ✅ **User Dashboard**: View bookings, payments, profile
- ✅ **Vendor Dashboard**: Manage vehicles, view earnings, track bookings
- ✅ **Admin Dashboard**: System analytics, user management, reports

### 🤖 AI Chatbot
- ✅ **Google Gemini-powered chatbot**
- ✅ **24/7 customer support**
- ✅ **Context-aware responses**
- ✅ **Vehicle recommendation assistance**

### 📱 Additional Features
- ✅ **SMS notifications** via Twilio
- ✅ **Email notifications** via SendGrid/Nodemailer
- ✅ **Rate limiting & security** (Helmet, XSS protection)
- ✅ **Responsive design** for all devices
- ✅ **PDF report generation**
- ✅ **CSV data export**
- ✅ **Automated cron jobs** for bookings
- ✅ **Real-time socket notifications**

---

## 🛠 Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.17-06B6D4?style=flat-square&logo=tailwindcss)
![React Router](https://img.shields.io/badge/React_Router-7.9.6-CA4245?style=flat-square&logo=react-router)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-orange?style=flat-square)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=flat-square)
![Socket.io](https://img.shields.io/badge/Socket.io-Client-010101?style=flat-square&logo=socket.io)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=json-web-tokens)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7.0-010101?style=flat-square&logo=socket.io)

### AI Chatbot
![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688?style=flat-square&logo=fastapi)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google)

### Payment & Services
![Razorpay](https://img.shields.io/badge/Razorpay-Payment-0C2451?style=flat-square)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=flat-square&logo=cloudinary)
![Twilio](https://img.shields.io/badge/Twilio-SMS-F22F46?style=flat-square&logo=twilio)
![SendGrid](https://img.shields.io/badge/SendGrid-Email-3992C1?style=flat-square)

### Security & Utilities
![Helmet](https://img.shields.io/badge/Helmet-Security-yellow?style=flat-square)
![bcrypt](https://img.shields.io/badge/bcrypt-Encryption-red?style=flat-square)
![Express Rate Limit](https://img.shields.io/badge/Rate_Limiting-Enabled-green?style=flat-square)
![Node Cron](https://img.shields.io/badge/Node_Cron-Jobs-blue?style=flat-square)

---

## 🏗 Project Architecture

```
vehicle-rental-services/
│
├── 📂 client/                    # React Frontend
│   ├── src/
│   │   ├── api/                  # API integration layer
│   │   ├── components/           # Reusable React components
│   │   │   ├── booking/          # Booking-related components
│   │   │   ├── common/           # Shared components (Navbar, Footer, etc.)
│   │   │   ├── payment/          # Payment components
│   │   │   └── vehicle/          # Vehicle components
│   │   ├── pages/                # Page components
│   │   │   ├── admin/            # Admin pages
│   │   │   └── dashboards/       # Role-based dashboards
│   │   ├── hooks/                # Custom React hooks
│   │   ├── store/                # Zustand state management
│   │   └── assets/               # Static assets
│   └── public/                   # Public files
│
├── 📂 server/                    # Node.js Backend
│   ├── config/                   # Configuration files
│   ├── controllers/              # Route controllers
│   ├── middleware/               # Custom middleware
│   ├── models/                   # Mongoose models
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic services
│   ├── cron/                     # Scheduled jobs
│   └── seed/                     # Database seeders
│
└── 📂 chatbot/                   # Python AI Chatbot
    └── main.py                   # FastAPI chatbot server
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sahilgupta2175/vehicle-rental-services.git
cd vehicle-rental-services
```

#### 2️⃣ Setup Backend (Server)

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Email Configuration (SendGrid or Nodemailer)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_email@example.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Socket.io
SOCKET_PORT=5000
```

Start the backend server:

```bash
npm run dev
```

#### 3️⃣ Setup Frontend (Client)

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the frontend development server:

```bash
npm run dev
```

#### 4️⃣ Setup AI Chatbot

```bash
cd ../chatbot
pip install -r requirements.txt
```

Create a `.env` file in the `chatbot` directory:

```env
GOOGLE_API_KEY=your_google_gemini_api_key
```

Start the chatbot server:

```bash
python main.py
```

#### 5️⃣ Seed Database (Optional)

To populate the database with sample data:

```bash
cd server
npm run seed
```

---

## 🎮 Usage

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Chatbot API**: http://localhost:8000

### User Roles

1. **User/Customer**
   - Browse and search vehicles
   - Make bookings
   - Process payments
   - View booking history

2. **Vendor**
   - Add/edit/delete vehicles
   - View bookings for their vehicles
   - Track earnings
   - Manage availability

3. **Admin**
   - Manage all users and vendors
   - View system analytics
   - Generate reports
   - Monitor transactions

### Default Login Credentials (After Seeding)

```
Admin:
Email: admin@example.com
Password: admin123

Vendor:
Email: vendor@example.com
Password: vendor123

User:
Email: user@example.com
Password: user123
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Vehicle Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | Get all vehicles (with filters) |
| GET | `/api/vehicles/:id` | Get vehicle by ID |
| POST | `/api/vehicles` | Create vehicle (Vendor) |
| PUT | `/api/vehicles/:id` | Update vehicle (Vendor) |
| DELETE | `/api/vehicles/:id` | Delete vehicle (Vendor) |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get user bookings |
| GET | `/api/bookings/:id` | Get booking details |
| POST | `/api/bookings` | Create new booking |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments/history` | Get payment history |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/stats` | Get system statistics |

For complete API documentation, visit: `/api-docs` (when server is running)

---

## 📁 Project Structure

### Backend Models

- **User**: User authentication and profile management
- **Vehicle**: Vehicle information and availability
- **Booking**: Rental booking details and status
- **Transaction**: Payment and transaction records

### Frontend Components

- **Common**: Navbar, Footer, Loader, DatePicker, ChatBot
- **Vehicle**: VehicleCard, VehicleForm
- **Booking**: BookingCard
- **Payment**: RazorpayPayment
- **Protected Routes**: Role-based access control

### Key Services

- **Email Service**: SendGrid/Nodemailer integration
- **SMS Service**: Twilio integration
- **Payment Service**: Razorpay integration
- **Storage Service**: Cloudinary integration
- **Report Service**: PDF and CSV generation

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Sahil Gupta**

GitHub: [@Sahilgupta2175](https://github.com/Sahilgupta2175)

Project Link: [https://github.com/Sahilgupta2175/vehicle-rental-services](https://github.com/Sahilgupta2175/vehicle-rental-services)

---

## 🙏 Acknowledgments

- [React Documentation](https://reactjs.org/)
- [Node.js Documentation](https://nodejs.org/)
- [MongoDB Documentation](https://www.mongodb.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Razorpay](https://razorpay.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Cloudinary](https://cloudinary.com/)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made with ❤️ by Sahil Gupta

</div>
