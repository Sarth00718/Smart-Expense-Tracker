# Smart Expense Tracker - Backend API

Production-ready RESTful API built with Node.js, Express, and MongoDB using modern ES Modules architecture.

## 🏗️ Architecture

```
Clean Layered Architecture:
Routes → Controllers → Services → Repositories → Models → Database
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.js        # Environment validation
│   │   └── database.js   # MongoDB connection
│   ├── models/           # Mongoose schemas (unchanged from original)
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── server.js         # Application entry point
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🔧 Environment Variables

See `.env.example` for all required and optional environment variables.

Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (min 32 characters)

Optional:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `GROQ_API_KEY` - For AI assistant feature
- `CLIENT_URL` - Frontend URL for CORS

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication
All protected routes require JWT token:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/firebase-sync` - Sync Firebase user
- `POST /api/auth/link-firebase` - Link Firebase to existing account

#### Expenses
- `GET /api/expenses` - Get all expenses (paginated)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary` - Get expense summary
- `GET /api/expenses/recurring` - Get recurring expenses

#### Income
- `GET /api/income` - Get all income (paginated)
- `POST /api/income` - Create income
- `GET /api/income/:id` - Get single income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

#### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Set budget
- `DELETE /api/budgets/:category` - Delete budget
- `GET /api/budgets/status` - Get budget status

#### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `GET /api/goals/:id` - Get single goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

#### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/heatmap` - Get spending heatmap
- `GET /api/analytics/patterns` - Get spending patterns
- `GET /api/analytics/trends` - Get spending trends

#### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/suggestions` - Get AI suggestions
- `GET /api/ai/history` - Get chat history

#### Achievements
- `GET /api/achievements` - Get user achievements
- `POST /api/achievements/check` - Check for new achievements

#### Receipts
- `POST /api/receipts/scan` - Scan receipt (OCR)
- `POST /api/receipts/upload` - Upload receipt image

#### Reports & Export
- `GET /api/reports/pdf` - Generate PDF report
- `GET /api/export/excel` - Export to Excel
- `GET /api/export/csv` - Export to CSV
- `GET /api/export/json` - Export to JSON

#### Voice
- `POST /api/voice/parse` - Parse voice input

#### Filters
- `GET /api/filters` - Get saved filters
- `POST /api/filters` - Save filter
- `DELETE /api/filters/:id` - Delete filter

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/preferences` - Update preferences

#### Biometric
- `POST /api/biometric/register` - Register biometric credential
- `POST /api/biometric/authenticate` - Authenticate with biometric

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Rate limiting on all routes
- Input validation and sanitization
- MongoDB injection prevention
- XSS protection
- Secure HTTP headers
- CORS configuration

## ⚡ Performance

- Database indexing (compound indexes)
- Aggregation pipelines for analytics
- Connection pooling (10 max, 5 min)
- Pagination on all list endpoints
- Compression middleware

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Database Models

### User
- Authentication (local, Firebase, biometric)
- Profile information
- Preferences
- Timestamps

### Expense
- User reference
- Date, category, amount
- Description, payment mode
- Receipt image
- Tags, recurring flag

### Income
- User reference
- Date, source, amount
- Description
- Recurring flag

### Budget
- User reference
- Category, monthly budget
- Unique per user-category

### Goal
- User reference
- Name, target amount
- Current amount, deadline

### Achievement
- User reference
- Badge name, type
- Earned date

### ChatHistory
- User reference
- Conversation ID
- Messages array
- Last message timestamp

### SavedFilter
- User reference
- Filter name
- Filter criteria
- Default flag

## 🚀 Deployment

### Environment Setup
1. Set all required environment variables
2. Ensure MongoDB is accessible
3. Configure CORS origins

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure MongoDB Atlas connection
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure logging
- [ ] Set up monitoring

### Deployment Platforms

#### Render
```yaml
# render.yaml
services:
  - type: web
    name: expense-tracker-api
    env: node
    buildCommand: npm install
    startCommand: npm start
```

#### Heroku
```bash
heroku create expense-tracker-api
heroku addons:create mongolab
git push heroku main
```

## 📊 Monitoring

- Health check endpoint: `/health`
- MongoDB connection status
- Server uptime
- Process metrics

## 🤝 Contributing

1. Follow ES Modules syntax
2. Use async/await for async operations
3. Implement proper error handling
4. Add JSDoc comments
5. Follow existing code structure

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Related

- Frontend: `../frontend`
- Documentation: `../docs`
- Original Project: `../client` and `../server`
