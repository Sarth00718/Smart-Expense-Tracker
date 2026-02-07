# Smart Expense Tracker - MERN Stack

A full-featured expense tracking application built with MongoDB, Express.js, React, and Node.js. Track expenses, manage budgets, set financial goals, and get AI-powered insights.

## Features

### Core Features
- 📊 **Expense Tracking** - Add, edit, delete, and categorize expenses
- 💰 **Income Management** - Track multiple income sources
- 🎯 **Budget Planning** - Set and monitor category-based budgets
- 🏆 **Savings Goals** - Create and track financial goals
- 📈 **Analytics Dashboard** - Visualize spending patterns with charts
- 🔍 **Advanced Search** - Natural language search and filtering
- 📱 **PWA Support** - Install as mobile/desktop app, works offline

### Advanced Features
- 🤖 **AI Assistant** - Get personalized financial advice (Groq API)
- 📸 **Receipt Scanner** - OCR-powered receipt scanning (Tesseract.js)
- 🎤 **Voice Input** - Add expenses via voice commands
- 🏅 **Achievements** - Gamification with badges and milestones
- 📊 **Spending Heatmap** - Calendar view of daily expenses
- 📄 **PDF Reports** - Generate detailed financial reports
- 🔐 **Dual Authentication** - Backend JWT + Firebase Auth support

## Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Tesseract.js** - OCR for receipts
- **PDFKit** - PDF report generation
- **Groq API** - AI-powered insights

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Chart.js** & **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Firebase** - Optional authentication
- **Workbox** - Service worker for PWA

## Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- (Optional) Groq API key for AI features
- (Optional) Firebase project for Firebase Auth

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
GROQ_API_KEY=your_groq_api_key_optional
CLIENT_URL=http://localhost:3000
```

5. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_AUTH_METHOD=backend

# Optional Firebase configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run dev
```

Client will run on `http://localhost:3000`

## Deployment

### Backend Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Add environment variables from `.env.example`

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Configure:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variables

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/firebase-sync` - Sync Firebase user

### Expense Endpoints
- `GET /api/expenses` - Get all expenses (paginated)
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/filter` - Filter expenses
- `POST /api/expenses/search` - Natural language search
- `GET /api/expenses/categories` - Get unique categories
- `GET /api/expenses/summary` - Get expense summary

### Income Endpoints
- `GET /api/income` - Get all income (paginated)
- `POST /api/income` - Add new income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income
- `GET /api/income/summary` - Get income summary

### Budget Endpoints
- `GET /api/budgets` - Get all budgets with spending
- `POST /api/budgets` - Set budget for category
- `DELETE /api/budgets/:category` - Delete budget

### Goals Endpoints
- `GET /api/goals` - Get all savings goals
- `POST /api/goals` - Add new goal
- `PUT /api/goals/:id` - Update goal progress
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/stats` - Get goals statistics

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/heatmap` - Spending heatmap data
- `GET /api/analytics/patterns` - Behavioral patterns
- `GET /api/analytics/predictions` - Future expense predictions
- `GET /api/analytics/score` - Spending score

### AI Endpoints
- `POST /api/ai/chat` - Conversational AI assistant
- `GET /api/ai/suggestions` - AI-powered suggestions

### Other Endpoints
- `POST /api/receipts/scan` - Scan receipt image
- `POST /api/voice/parse` - Parse voice command
- `GET /api/reports/pdf` - Generate PDF report
- `GET /api/achievements` - Get user achievements
- `GET /api/health` - Health check

## Security Features

- ✅ JWT-based authentication with secure token storage
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Rate limiting on all routes
- ✅ CORS configuration with whitelist
- ✅ Input validation and sanitization
- ✅ MongoDB injection prevention
- ✅ XSS protection
- ✅ Environment variable validation
- ✅ Secure HTTP headers
- ✅ Request timeout limits

## Performance Optimizations

- ✅ Database indexing on frequently queried fields
- ✅ Pagination for large datasets
- ✅ Aggregation pipelines for analytics
- ✅ Code splitting and lazy loading
- ✅ Image optimization
- ✅ Service worker caching
- ✅ Gzip compression
- ✅ CDN-ready static assets

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API endpoints

## Acknowledgments

- Chart.js for data visualization
- Tesseract.js for OCR capabilities
- Groq for AI-powered insights
- Firebase for authentication
- MongoDB for database
- Vercel and Render for hosting
