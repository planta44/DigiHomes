# DIGI Homes Agencies

A full-stack web application for a housing agency operating in Nakuru and Nyahururu, Kenya.

![DIGI Homes](https://img.shields.io/badge/DIGI-Homes-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)

## Features

### Public Interface
- 🏠 Browse available rental houses
- 🔍 Search and filter by location, type, and availability
- 📱 Fully responsive design (mobile + desktop)
- 📧 Newsletter subscription
- 📞 Contact information with WhatsApp integration

### Admin Dashboard
- 🔐 Secure JWT authentication (hidden login via newsletter)
- ➕ Add new house listings
- ✏️ Edit house details
- 📸 Upload multiple images per property
- 🔄 Update vacancy status
- 🗑️ Delete listings
- 📊 Dashboard with statistics
- 👥 Manage newsletter subscribers

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - API calls
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js + Express** - Server
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## Project Structure

```
DIGI/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config & SQL
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── seeds/          # Database seeder
│   │   └── server.js       # Entry point
│   ├── uploads/            # Uploaded images
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── config/         # API configuration
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin pages
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Clone and Setup

```bash
cd DIGI
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/digi_homes
```

### 3. Database Setup

Create the database:
```sql
CREATE DATABASE digi_homes;
```

Run the seed script to create tables and sample data:
```bash
npm run seed
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on: http://localhost:5173

## Admin Access

⚠️ **Important:** Admin login is intentionally hidden from the public UI.

### How to Access Admin:
1. Go to the **Newsletter section** in the footer
2. Enter the admin email: `admin@digihomes.co.ke`
3. A password modal will appear
4. Enter password: `admin123`
5. You'll be redirected to the Admin Dashboard

### Default Admin Credentials
- **Email:** admin@digihomes.co.ke
- **Password:** admin123

> Change these credentials in production!

## API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/houses` | Get all houses |
| GET | `/api/houses/:id` | Get single house |
| GET | `/api/houses/types` | Get house types |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |
| POST | `/api/auth/check-admin` | Check if email is admin |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/houses` | Create house |
| PUT | `/api/houses/:id` | Update house |
| DELETE | `/api/houses/:id` | Delete house |
| GET | `/api/houses/admin/stats` | Get dashboard stats |
| POST | `/api/upload/house/:id` | Upload images |
| DELETE | `/api/upload/image/:id` | Delete image |
| GET | `/api/newsletter/subscribers` | Get subscribers |
| DELETE | `/api/newsletter/subscribers/:id` | Remove subscriber |

## Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`
6. Deploy!

### Frontend (Netlify)
1. Create a new site on Netlify
2. Connect your repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`
6. Deploy!

### Database (Render/Supabase)
- Use Render PostgreSQL or Supabase for production database
- Update `DATABASE_URL` in backend environment

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/digi_homes
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Sample Data

The seed script creates:
- 1 Admin user
- 8 Sample houses (various types and locations)
- 3 Sample newsletter subscribers

## Screenshots

### Public Pages
- **Home** - Hero section, featured houses, locations
- **Houses** - Filterable house listings
- **House Details** - Image gallery, property info, contact buttons
- **Contact** - Office locations, FAQ

### Admin Pages
- **Dashboard** - Stats overview, quick actions
- **Manage Houses** - CRUD table with filters
- **Add/Edit House** - Form with image upload
- **Subscribers** - Subscriber management with export

## Future Enhancements

- [ ] Google Maps integration for house locations
- [ ] Email notifications for inquiries
- [ ] Multiple admin users
- [ ] House inquiry/booking system
- [ ] Advanced search with price range
- [ ] Image optimization/compression

## License

This project is proprietary software for DIGI Homes Agencies.

## Support

For support, contact:
- 📧 info@digihomes.co.ke
- 📞 +254 700 000 000
