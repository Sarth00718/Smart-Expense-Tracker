# Smart Expense Tracker - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Usage Guide](#usage-guide)
6. [API Reference](#api-reference)
7. [Components](#components)
8. [Services](#services)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Project Overview

Smart Expense Tracker is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to help users manage their finances effectively. It combines traditional expense tracking with modern features like AI assistance, voice input, receipt scanning, and PWA capabilities.

### Key Highlights
- **Full-Stack MERN Application** - MongoDB, Express.js, React 18, Node.js
- **Progressive Web App (PWA)** - Install on any device, works offline
- **AI-Powered Insights** - ChatGPT-style financial assistant using Groq API
- **Multi-Platform** - Web, mobile, desktop (via PWA)
- **Dual Authentication** - Backend JWT + Firebase Auth support
- **Real-time Analytics** - Interactive charts and spending patterns
- **Gamification** - Achievements and milestones

## Features

### 1. Core Financial Management


#### Expense Tracking
- **Add Expenses** - Quick entry with category, amount, date, description
- **Edit/Delete** - Full CRUD operations on all expenses
- **Categories** - Pre-defined and custom categories
- **Recurring Expenses** - Set up monthly bills and subscriptions
- **Attachments** - Link receipts to expenses
- **Tags** - Organize with custom tags

#### Income Management
- **Multiple Sources** - Track salary, freelance, investments, etc.
- **Recurring Income** - Set up regular income streams
- **Income Categories** - Organize by source type
- **Date Tracking** - Historical income records

#### Budget Planning
- **Category Budgets** - Set spending limits per category
- **Monthly/Yearly** - Flexible time periods
- **Progress Tracking** - Real-time budget vs actual
- **Alerts** - Notifications when approaching limits
- **AI Recommendations** - Smart budget suggestions based on income

#### Savings Goals
- **Goal Creation** - Set target amount and deadline
- **Progress Tracking** - Visual progress indicators
- **Multiple Goals** - Track multiple goals simultaneously
- **Milestone Celebrations** - Confetti animations on achievements

### 2. Advanced Features

#### AI Assistant 🤖

- **Conversational Interface** - ChatGPT-style chat experience
- **Natural Language Queries** - Ask questions in plain English
  - "Where did I overspend this month?"
  - "Show me my food expenses for last week"
  - "What's my average monthly spending?"
- **Budget Suggestions** - "Suggest budget plan for ₹20,000 salary"
- **Spending Analysis** - Get insights on spending patterns
- **Voice Input** - Speak your questions (uses Web Speech API)
- **Context-Aware** - Understands your financial data
- **Powered by Groq API** - Fast, accurate AI responses

#### Receipt Scanner 📸
- **OCR Technology** - Tesseract.js for text extraction
- **Auto-Fill** - Extracts amount, date, merchant
- **Image Upload** - Drag & drop or click to upload
- **Preview** - See scanned image before saving
- **Manual Override** - Edit extracted data if needed
- **Supported Formats** - JPG, PNG, PDF

#### Voice Input 🎤
- **Voice Commands** - Add expenses by speaking
- **Natural Language** - "Add 50 dollars for lunch at McDonald's"
- **Hands-Free** - Perfect for on-the-go entry
- **Multi-Language** - Supports multiple languages
- **Real-time Feedback** - Visual animation while listening

#### Analytics Dashboard 📊

- **Interactive Charts** - Chart.js and Recharts visualizations
- **Spending Heatmap** - Calendar view of daily expenses
- **Category Breakdown** - Pie charts and bar graphs
- **Trend Analysis** - Month-over-month comparisons
- **Income vs Expenses** - Net savings tracking
- **Top Expenses** - Identify biggest spending categories
- **Time-based Filters** - Daily, weekly, monthly, yearly views
- **Export Charts** - Download as images

#### Achievements & Gamification 🏆
- **Milestone Badges** - Earn badges for financial goals
- **Streak Tracking** - Daily expense logging streaks
- **Level System** - Progress through levels
- **Confetti Celebrations** - Visual rewards
- **Achievement Types**:
  - First Expense
  - Budget Master (stay under budget)
  - Savings Champion (reach goals)
  - Consistent Tracker (30-day streak)
  - Category Expert (track all categories)

#### Data Export 📄
- **Multiple Formats** - CSV, Excel, JSON, PDF
- **Selective Export** - Choose expenses, income, or all data
- **Date Range Filters** - Export specific time periods
- **Comprehensive PDF Reports** - Full financial summary with charts
- **Excel Workbooks** - Multiple sheets for different data types


#### Progressive Web App (PWA) 📱
- **Install on Any Device** - Mobile, tablet, desktop
- **Offline Support** - Works without internet
- **Background Sync** - Syncs when connection restored
- **Push Notifications** - Budget alerts, goal reminders
- **App-Like Experience** - Full-screen, no browser UI
- **Fast Loading** - Service worker caching
- **Auto-Updates** - Seamless app updates
- **Storage Management** - View and clear cache

#### Security & Authentication 🔐
- **Dual Auth System**:
  - **Backend JWT** - Traditional email/password
  - **Firebase Auth** - Google, email/password
- **Biometric Login** - Fingerprint/Face ID support
- **Password Hashing** - Bcrypt with 10 rounds
- **Secure Tokens** - HTTP-only cookies option
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Express-validator
- **XSS Protection** - Sanitized inputs
- **CORS Configuration** - Whitelist allowed origins

### 3. User Interface

#### Responsive Design
- **Mobile-First** - Optimized for small screens
- **Tablet Support** - Adaptive layouts
- **Desktop Experience** - Full-featured interface

- **Touch-Friendly** - Large tap targets
- **Smooth Animations** - Framer Motion transitions
- **Dark Mode Ready** - Theme support (coming soon)

#### Navigation
- **Desktop Sidebar** - Full navigation menu with 9 sections
- **Mobile Bottom Nav** - 5 key sections for quick access
- **Header** - Notifications, export, user menu
- **Breadcrumbs** - Easy navigation tracking

#### Components
- **Animated Cards** - Smooth entrance animations
- **Loading Skeletons** - Better perceived performance
- **Toast Notifications** - React Hot Toast feedback
- **Modals** - Accessible dialog components
- **Empty States** - Helpful messages when no data
- **Confetti Effects** - Celebration animations

## Architecture

### Frontend Structure
```
client/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared components
│   │   ├── features/    # Feature-specific components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
```


### Backend Structure
```
server/
├── middleware/          # Express middleware
│   ├── auth.js         # JWT authentication
│   ├── rateLimiter.js  # Rate limiting
│   └── security.js     # Security headers
├── models/             # Mongoose models
│   ├── User.js
│   ├── Expense.js
│   ├── Income.js
│   ├── Budget.js
│   ├── Goal.js
│   └── Achievement.js
├── routes/             # API routes
├── utils/              # Utility functions
│   ├── achievements.js
│   ├── analytics.js
│   ├── nlp.js
│   ├── ocr.js
│   └── voiceParser.js
└── server.js           # Entry point
```

### Database Schema

#### User Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  firebaseUid: String,
  authMethod: String,
  picture: String,
  createdAt: Date
}
```

#### Expense Model
```javascript
{
  userId: ObjectId,
  amount: Number,
  category: String,
  description: String,
  date: Date,
  paymentMethod: String,
  tags: [String],
  receiptUrl: String,
  isRecurring: Boolean,
  recurringFrequency: String
}
```


#### Income Model
```javascript
{
  userId: ObjectId,
  amount: Number,
  source: String,
  description: String,
  date: Date,
  isRecurring: Boolean,
  recurringFrequency: String
}
```

#### Budget Model
```javascript
{
  userId: ObjectId,
  category: String,
  amount: Number,
  period: String,
  startDate: Date,
  endDate: Date
}
```

#### Goal Model
```javascript
{
  userId: ObjectId,
  name: String,
  targetAmount: Number,
  currentAmount: Number,
  deadline: Date,
  category: String,
  priority: String
}
```

## Installation

### Prerequisites
- **Node.js** 16+ and npm 8+
- **MongoDB** (local or Atlas)
- **Groq API Key** (optional, for AI features)
- **Firebase Project** (optional, for Firebase Auth)

### Quick Start

1. **Clone Repository**
```bash
git clone <repository-url>
cd smart-expense-tracker
```

2. **Backend Setup**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```


3. **Frontend Setup**
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
GROQ_API_KEY=your_groq_api_key_optional
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_AUTH_METHOD=backend

# Optional Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Usage Guide

### Getting Started

1. **Register Account**
   - Click "Sign Up" on login page
   - Enter full name, email, password
   - Or use Google Sign-In (if Firebase enabled)

2. **Add First Expense**
   - Navigate to Expenses page
   - Click "Add Expense" button
   - Fill in amount, category, date, description
   - Click "Save"


3. **Set Up Budget**
   - Go to Budgets page
   - Click "Add Budget"
   - Select category and set amount
   - Choose time period (monthly/yearly)

4. **Create Savings Goal**
   - Navigate to Goals page
   - Click "Add Goal"
   - Enter goal name, target amount, deadline
   - Track progress as you save

5. **View Analytics**
   - Check Dashboard for overview
   - Visit Analytics for detailed insights
   - Use date filters to analyze specific periods

### Using AI Assistant

1. **Open AI Assistant**
   - Click "AI Assistant" in sidebar
   - Or use voice button in header

2. **Ask Questions**
   - Type or speak your question
   - Examples:
     - "How much did I spend on food this month?"
     - "Show me my biggest expenses"
     - "Suggest a budget for my salary"
     - "Am I on track with my savings goal?"

3. **Get Insights**
   - AI analyzes your data
   - Provides personalized recommendations
   - Suggests budget optimizations

### Scanning Receipts

1. **Open Receipt Scanner**
   - Navigate to Receipts section
   - Or click camera icon in expenses

2. **Upload Receipt**
   - Take photo or upload image
   - Wait for OCR processing
   - Review extracted data

3. **Save Expense**
   - Edit any incorrect fields
   - Add additional details
   - Save to expenses


### Voice Input

1. **Activate Voice**
   - Click microphone icon
   - Grant microphone permission
   - Speak your expense

2. **Voice Command Format**
   - "Add [amount] for [category] at [place]"
   - Example: "Add 50 dollars for lunch at Starbucks"

3. **Confirm & Save**
   - Review parsed data
   - Edit if needed
   - Save expense

### Exporting Data

1. **Open Export Modal**
   - Click "Export" button in header
   - Select data type (all/expenses/income)

2. **Choose Format**
   - CSV - For spreadsheets
   - Excel - Native Excel format
   - JSON - Raw data
   - PDF - Comprehensive report

3. **Set Date Range** (optional)
   - Select start and end dates
   - Or leave empty for all data

4. **Download**
   - Click format button
   - File downloads automatically

### Installing as PWA

#### Mobile (iOS)
1. Open in Safari
2. Tap Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

#### Mobile (Android)
1. Open in Chrome
2. Tap menu (three dots)
3. Tap "Install app" or "Add to Home screen"
4. Tap "Install"

#### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click "Install"
3. App opens in standalone window


## API Reference

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Expenses

#### Get All Expenses
```http
GET /api/expenses?page=1&limit=10&category=food&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Add Expense
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "category": "food",
  "description": "Lunch at restaurant",
  "date": "2024-02-08",
  "paymentMethod": "credit_card"
}
```

#### Update Expense
```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 55.00,
  "description": "Updated description"
}
```


#### Delete Expense
```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

#### Natural Language Search
```http
POST /api/expenses/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "food expenses last month"
}
```

### Income

#### Get All Income
```http
GET /api/income?page=1&limit=10
Authorization: Bearer <token>
```

#### Add Income
```http
POST /api/income
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000.00,
  "source": "salary",
  "description": "Monthly salary",
  "date": "2024-02-01"
}
```

### Budgets

#### Get All Budgets
```http
GET /api/budgets
Authorization: Bearer <token>
```

#### Set Budget
```http
POST /api/budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "food",
  "amount": 500.00,
  "period": "monthly"
}
```

### Goals

#### Get All Goals
```http
GET /api/goals
Authorization: Bearer <token>
```

#### Create Goal
```http
POST /api/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Emergency Fund",
  "targetAmount": 10000.00,
  "deadline": "2024-12-31",
  "category": "savings"
}
```


### Analytics

#### Dashboard Stats
```http
GET /api/analytics/dashboard?period=month
Authorization: Bearer <token>
```

#### Spending Heatmap
```http
GET /api/analytics/heatmap?year=2024&month=2
Authorization: Bearer <token>
```

#### Spending Patterns
```http
GET /api/analytics/patterns
Authorization: Bearer <token>
```

### AI Assistant

#### Chat with AI
```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "How much did I spend on food this month?",
  "conversationHistory": []
}
```

### Receipt Scanner

#### Scan Receipt
```http
POST /api/receipts/scan
Authorization: Bearer <token>
Content-Type: multipart/form-data

receipt: <image file>
```

### Voice Input

#### Parse Voice Command
```http
POST /api/voice/parse
Authorization: Bearer <token>
Content-Type: application/json

{
  "transcript": "Add 50 dollars for lunch at McDonald's"
}
```

## Components

### Layout Components

#### Header
- **Location**: `client/src/components/layout/Header.jsx`
- **Features**:
  - Notification bell with dropdown
  - Export button
  - User profile menu
  - Mobile menu toggle
- **Props**: `toggleSidebar: function`


#### Sidebar
- **Location**: `client/src/components/layout/Sidebar.jsx`
- **Features**:
  - Desktop navigation menu
  - 9 navigation items
  - Active route highlighting
  - Mobile overlay
- **Props**: `isOpen: boolean, setIsOpen: function`

#### MobileNav
- **Location**: `client/src/components/layout/MobileNav.jsx`
- **Features**:
  - Bottom navigation for mobile
  - 5 key sections
  - Icon + label
  - Active state

### Feature Components

#### Expenses
- **Location**: `client/src/components/features/expenses/Expenses.jsx`
- **Features**:
  - Expense list with pagination
  - Add/Edit/Delete operations
  - Category filtering
  - Date range filtering
  - Search functionality

#### AdvancedSearch
- **Location**: `client/src/components/features/expenses/AdvancedSearch.jsx`
- **Features**:
  - Natural language search
  - Multiple filters
  - Saved filters
  - Quick filters

#### Budgets
- **Location**: `client/src/components/features/budgets/Budgets.jsx`
- **Features**:
  - Budget cards with progress
  - Add/Edit budgets
  - Visual progress bars
  - Alert indicators

#### Goals
- **Location**: `client/src/components/features/goals/Goals.jsx`
- **Features**:
  - Goal cards
  - Progress tracking
  - Milestone celebrations
  - Add/Update goals

#### AIAssistant
- **Location**: `client/src/components/features/ai/AIAssistant.jsx`
- **Features**:
  - Chat interface
  - Voice input
  - Conversation history
  - Typing indicators


#### ReceiptScanner
- **Location**: `client/src/components/features/receipts/ReceiptScanner.jsx`
- **Features**:
  - Image upload
  - OCR processing
  - Data extraction
  - Preview & edit

#### Analytics
- **Location**: `client/src/components/features/analytics/Analytics.jsx`
- **Features**:
  - Multiple chart types
  - Interactive visualizations
  - Date filters
  - Export charts

#### SpendingHeatmap
- **Location**: `client/src/components/features/analytics/SpendingHeatmap.jsx`
- **Features**:
  - Calendar view
  - Daily spending amounts
  - Color-coded intensity
  - Month navigation

### UI Components

#### Card
- **Location**: `client/src/components/ui/Card.jsx`
- **Usage**: `<Card className="...">Content</Card>`
- **Features**: Styled container with shadow

#### Button
- **Location**: `client/src/components/ui/Button.jsx`
- **Usage**: `<Button variant="primary" onClick={...}>Text</Button>`
- **Variants**: primary, secondary, danger, ghost

#### Modal
- **Location**: `client/src/components/ui/Modal.jsx`
- **Usage**: `<Modal isOpen={true} onClose={...}>Content</Modal>`
- **Features**: Backdrop, close button, animations

#### AnimatedCard
- **Location**: `client/src/components/ui/AnimatedCard.jsx`
- **Features**: Entrance animations, hover effects

#### AnimatedCounter
- **Location**: `client/src/components/ui/AnimatedCounter.jsx`
- **Features**: Number counting animation

#### ConfettiEffect
- **Location**: `client/src/components/ui/ConfettiEffect.jsx`
- **Features**: Celebration animation

#### EmptyState
- **Location**: `client/src/components/ui/EmptyState.jsx`
- **Features**: Icon, message, action button


## Services

### API Service
- **Location**: `client/src/services/api.js`
- **Purpose**: Axios instance with interceptors
- **Features**:
  - Auto token attachment
  - Error handling
  - Request/response logging

### Auth Service
- **Location**: `client/src/services/authService.js`
- **Methods**:
  - `register(userData)` - Register new user
  - `login(credentials)` - Login user
  - `logout()` - Logout user
  - `getCurrentUser()` - Get stored user
  - `getAuthMethod()` - Get auth method

### Expense Service
- **Location**: `client/src/services/expenseService.js`
- **Methods**:
  - `getExpenses(params)` - Fetch expenses
  - `addExpense(data)` - Create expense
  - `updateExpense(id, data)` - Update expense
  - `deleteExpense(id)` - Delete expense
  - `searchExpenses(query)` - Natural language search

### Budget Service
- **Location**: `client/src/services/budgetService.js`
- **Methods**:
  - `getBudgets()` - Fetch all budgets
  - `setBudget(data)` - Create/update budget
  - `deleteBudget(category)` - Delete budget

### Goal Service
- **Location**: `client/src/services/goalService.js`
- **Methods**:
  - `getGoals()` - Fetch all goals
  - `createGoal(data)` - Create goal
  - `updateGoal(id, data)` - Update goal
  - `deleteGoal(id)` - Delete goal

### Analytics Service
- **Location**: `client/src/services/analyticsService.js`
- **Methods**:
  - `getDashboardStats(period)` - Dashboard data
  - `getSpendingHeatmap(year, month)` - Heatmap data
  - `getSpendingPatterns()` - Pattern analysis

### Export Service
- **Location**: `client/src/services/exportService.js`
- **Methods**:
  - `exportExpensesCSV(start, end)` - Export to CSV
  - `exportExpensesExcel(start, end)` - Export to Excel
  - `exportExpensesJSON(start, end)` - Export to JSON
  - `exportComprehensivePDF(start, end)` - Generate PDF report


### Receipt Service
- **Location**: `client/src/services/receiptService.js`
- **Methods**:
  - `scanReceipt(imageFile)` - OCR scan receipt

### Voice Service
- **Location**: `client/src/services/voiceService.js`
- **Methods**:
  - `parseVoiceCommand(transcript)` - Parse voice input

## Deployment

### Backend Deployment (Render)

1. **Prepare Repository**
   - Push code to GitHub
   - Ensure `.env.example` is present

2. **Create Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect GitHub repository

3. **Configure Service**
   - **Name**: smart-expense-tracker-api
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free or Starter

4. **Environment Variables**
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`
   - Set `CLIENT_URL` to your frontend URL

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Note the service URL

### Frontend Deployment (Vercel)

1. **Prepare Repository**
   - Push code to GitHub
   - Ensure build works locally

2. **Import Project**
   - Go to Vercel Dashboard
   - Click "Add New" → "Project"
   - Import GitHub repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**
   - Add all variables from `.env.example`
   - Set `VITE_API_URL` to your backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Access via provided URL


### Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to MongoDB Atlas
   - Create free cluster
   - Choose region

2. **Configure Access**
   - Database Access → Add user
   - Network Access → Add IP (0.0.0.0/0 for all)

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

4. **Update Environment**
   - Set `MONGODB_URI` in backend env vars

### Custom Domain (Optional)

#### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown

#### Render
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Configure DNS records as shown

## Troubleshooting

### Common Issues

#### Backend won't start
- **Check MongoDB connection**: Ensure MongoDB is running
- **Check environment variables**: Verify all required vars are set
- **Check port**: Ensure port 5000 is not in use
- **Check logs**: Look for error messages in console

#### Frontend won't connect to backend
- **Check API URL**: Verify `VITE_API_URL` is correct
- **Check CORS**: Ensure backend allows frontend origin
- **Check network**: Open browser dev tools → Network tab
- **Check backend**: Ensure backend is running

#### Authentication not working
- **Check JWT secret**: Must be at least 32 characters
- **Check token**: Look in localStorage or cookies
- **Check auth method**: Verify `VITE_AUTH_METHOD` matches backend
- **Clear storage**: Try clearing localStorage and cookies

#### Firebase auth issues
- **Check credentials**: Verify all Firebase env vars
- **Check Firebase console**: Ensure auth methods are enabled
- **Check domain**: Add your domain to authorized domains
- **Check API key**: Ensure API key is correct


#### PWA not installing
- **Check HTTPS**: PWA requires HTTPS (except localhost)
- **Check manifest**: Verify `manifest.json` is accessible
- **Check service worker**: Look for errors in console
- **Check browser**: Some browsers have different install UX

#### Offline mode not working
- **Check service worker**: Ensure it's registered
- **Check cache**: Look in Application → Cache Storage
- **Check network**: Toggle offline in dev tools
- **Clear cache**: Try clearing and re-caching

#### AI assistant not responding
- **Check Groq API key**: Verify key is valid
- **Check API limits**: Ensure you haven't exceeded quota
- **Check network**: Verify backend is reachable
- **Check logs**: Look for errors in backend console

#### Receipt scanner not working
- **Check image format**: Use JPG or PNG
- **Check image quality**: Ensure text is clear
- **Check file size**: Keep under 5MB
- **Check Tesseract**: Ensure `eng.traineddata` exists

### Performance Issues

#### Slow loading
- **Check network**: Use browser dev tools
- **Check bundle size**: Run `npm run build` and check dist size
- **Check images**: Optimize large images
- **Check API calls**: Reduce unnecessary requests

#### High memory usage
- **Check memory leaks**: Use React DevTools Profiler
- **Check event listeners**: Ensure cleanup in useEffect
- **Check large lists**: Implement virtualization
- **Check images**: Lazy load images

### Database Issues

#### Connection timeout
- **Check MongoDB**: Ensure service is running
- **Check network**: Verify connectivity
- **Check credentials**: Verify username/password
- **Check IP whitelist**: Add your IP to Atlas

#### Slow queries
- **Check indexes**: Ensure proper indexing
- **Check query**: Optimize aggregation pipelines
- **Check data size**: Consider pagination
- **Check connection**: Use connection pooling

## Best Practices

### Development

1. **Use environment variables** for all configuration
2. **Follow component structure** for consistency
3. **Write reusable components** to avoid duplication
4. **Use TypeScript** for better type safety (future)
5. **Write tests** for critical functionality (future)
6. **Document complex logic** with comments
7. **Use Git branches** for features
8. **Review code** before merging


### Security

1. **Never commit** `.env` files
2. **Use strong JWT secrets** (32+ characters)
3. **Hash passwords** with bcrypt
4. **Validate all inputs** on backend
5. **Sanitize user data** to prevent XSS
6. **Use HTTPS** in production
7. **Implement rate limiting** on all routes
8. **Keep dependencies updated** regularly

### Performance

1. **Lazy load** components and routes
2. **Optimize images** before uploading
3. **Use pagination** for large datasets
4. **Implement caching** where appropriate
5. **Minimize bundle size** with code splitting
6. **Use CDN** for static assets
7. **Enable compression** (gzip/brotli)
8. **Monitor performance** with tools

### User Experience

1. **Provide loading states** for async operations
2. **Show error messages** clearly
3. **Use toast notifications** for feedback
4. **Implement empty states** for no data
5. **Make UI responsive** for all devices
6. **Use animations** sparingly
7. **Ensure accessibility** (ARIA labels, keyboard nav)
8. **Test on real devices** regularly

## Future Enhancements

### Planned Features
- [ ] Dark mode support
- [ ] Multi-currency support
- [ ] Expense sharing with family/friends
- [ ] Bank account integration
- [ ] Automated expense categorization
- [ ] Recurring expense templates
- [ ] Budget recommendations based on ML
- [ ] Investment tracking
- [ ] Tax calculation and reports
- [ ] Mobile apps (React Native)
- [ ] Desktop apps (Electron)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Webhook integrations
- [ ] API for third-party apps

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit tests (Jest)
- [ ] E2E tests (Playwright)
- [ ] GraphQL API
- [ ] Real-time updates (WebSockets)
- [ ] Microservices architecture
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Monitoring and logging
- [ ] Performance optimization
- [ ] Code documentation (JSDoc)

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Code Style
- Use ESLint configuration
- Follow existing patterns
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For help and support:
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this guide and other docs
- **Email**: Contact project maintainers

## Acknowledgments

- **Chart.js** - Beautiful charts
- **Tesseract.js** - OCR capabilities
- **Groq** - AI-powered insights
- **Firebase** - Authentication
- **MongoDB** - Database
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

---

**Last Updated**: February 8, 2026
**Version**: 1.0.0
**Maintained by**: Smart Expense Tracker Team
