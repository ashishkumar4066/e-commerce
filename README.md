# E-commerce Platform

A full-stack e-commerce application with automatic discount generation, user authentication, and admin management. Built with React, TypeScript, Node.js, Express, and MongoDB.

## Overview

- **Frontend**: React/TypeScript SPA with Tailwind CSS and shadcn/ui
- **Backend**: RESTful API with Express.js and MongoDB
- **Discount System**: Automatic 10% discount for every 5th order
- **Admin Panel**: Dashboard for order management and discount generation
- **Testing**: 84 tests with 100% route coverage

## Project Structure

```
e-commerce/
├── ecommerce-frontend/    # React frontend (Port: 5173)
├── ecommerce-backend/     # Express backend (Port: 5000)
└── README.md              # This file
```

## Quick Start

### 1. Backend Setup

```bash
cd ecommerce-backend
npm install
nodemon server.js
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd ecommerce-frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 3. Prerequisites

- Node.js v14+
- MongoDB (local or Atlas)

## User Credentials

### Regular Users

Users must **sign up** to use the app:

1. Click "Sign Up"
2. Enter User ID and Password
3. Start shopping

### Admin Access

```
Username: admin
Password: admin
```

Navigate to `/admin/login` to access the admin dashboard.

## Key Features

- ✅ User authentication and registration
- ✅ Product catalog with shopping cart
- ✅ Automatic discount codes (every 5th order gets 10% off)
- ✅ Order-specific discount validation
- ✅ Admin dashboard for order management
- ✅ Stock management and real-time updates

## Discount System

- Every **5th order** qualifies for discount (orders #5, #10, #15...)
- Discount code format: `DISCOUNT5`, `DISCOUNT10`, etc.
- **10% off** total order amount
- Codes are **order-specific** and **single-use**
- Auto-generated after completing order #4, #9, #14...

## API Endpoints

```
GET    /api/products                        # Get all products
POST   /api/checkout/placeOrder             # Place order
GET    /api/checkout/fetchAllOrder          # Get all orders (admin)
POST   /api/admin/generate-discount         # Generate discount code
```
