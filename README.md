# Real Estate Backend API

Backend API for the Real Estate Property Management System built with Node.js, Express, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (setup coming next)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd real-estate-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual values.

4. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Lint code

## 🛣️ API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication (Coming Soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Properties (Coming Soon)
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get single property
- `POST /api/agent/properties` - Create property (protected)
- `PUT /api/agent/properties/:id` - Update property (protected)
- `DELETE /api/agent/properties/:id` - Delete property (protected)

## 🔧 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (with pg driver)
- **Auth:** JWT + bcrypt
- **File Upload:** Multer
- **Validation:** Zod

## 📂 Project Structure

```
real-estate-backend/
├── src/
│   ├── server.ts           # Main server file
│   ├── controllers/        # Request handlers (coming soon)
│   ├── routes/            # API routes (coming soon)
│   ├── models/            # Database models (coming soon)
│   ├── middleware/        # Custom middleware (coming soon)
│   └── config/            # Configuration files (coming soon)
├── dist/                  # Compiled JavaScript (auto-generated)
├── .env                   # Environment variables
├── package.json
└── tsconfig.json
```

## 🌐 Environment Variables

Required environment variables (see `.env.example`):

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS

## 🔜 Next Steps

1. ✅ Basic server setup
2. ⏳ Database setup and migrations
3. ⏳ Authentication system
4. ⏳ Property CRUD endpoints
5. ⏳ File upload for images
6. ⏳ Inquiry management

## 📄 License

ISC
