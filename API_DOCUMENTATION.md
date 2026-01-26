# Smart Expense Tracker - API Documentation

## Overview
Complete MERN stack financial management application with AI-powered insights, income tracking, budget recommendations, and comprehensive analytics.

## Technical Architecture

### Backend Stack
- **Node.js + Express**: RESTful API server
- **MongoDB + Mongoose**: Document database with indexed schemas
- **JWT**: Stateless authentication
- **Rate Limiting**: express-rate-limit for DDoS protection
- **AI Integration**: Groq/OpenAI with retry logic and exponential backoff
- **PDF Generation**: PDFKit for financial reports

### Frontend Stack
- **React 18**: Component-based UI
- **React Router**: Client-side routing
- **Context API**: Global state management (Auth, Expense, Income, Theme)
- **Axios**: HTTP client with interceptors
- **TailwindCSS**: Utility-first styling
- **Chart.js**: Data visualization

---

## Authentication APIs

### POST /api/auth/register
Register a new user.

**Rate Limit**: 10 requests per 15 minutes

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /api/auth/login
Authenticate user and receive JWT token.

**Rate Limit**: 10 requests per 15 minutes

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

---

## Income APIs

### GET /api/income
Get all income with pagination and filters.

**Rate Limit**: 100 requests per minute

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 50): Items per page
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)
- `source`: Filter by income source

**Request**:
```bash
GET /api/income?page=1&limit=50&startDate=2024-01-01&source=Salary
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "userId": "507f1f77bcf86cd799439011",
      "date": "2024-01-15T00:00:00.000Z",
      "source": "Salary",
      "amount": 50000,
      "description": "Monthly salary",
      "isRecurring": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
```

### POST /api/income
Add new income entry.

**Request**:
```json
{
  "date": "2024-01-15",
  "source": "Salary",
  "amount": 50000,
  "description": "Monthly salary",
  "isRecurring": true
}
```

**Response** (201):
```json
{
  "_id": "65a1b2c3d4e5f6789012345",
  "userId": "507f1f77bcf86cd799439011",
  "date": "2024-01-15T00:00:00.000Z",
  "source": "Salary",
  "amount": 50000,
  "description": "Monthly salary",
  "isRecurring": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Income Sources**: Salary, Freelance, Investment, Business, Gift, Bonus, Rental, Other

### PUT /api/income/:id
Update income entry.

**Request**:
```json
{
  "amount": 55000,
  "description": "Salary with bonus"
}
```

### DELETE /api/income/:id
Delete income entry.

**Response** (200):
```json
{
  "message": "Income deleted successfully"
}
```

### GET /api/income/summary
Get income summary statistics.

**Response** (200):
```json
{
  "total_income": 150000,
  "this_month": 50000,
  "sources": [
    {
      "source": "Salary",
      "total": 100000,
      "count": 2
    },
    {
      "source": "Freelance",
      "total": 50000,
      "count": 5
    }
  ]
}
```

---

## Expense APIs

### GET /api/expenses
Get all expenses with pagination.

**Rate Limit**: 100 requests per minute

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 50)

**Response** (200):
```json
{
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012346",
      "userId": "507f1f77bcf86cd799439011",
      "date": "2024-01-15T00:00:00.000Z",
      "category": "Food",
      "amount": 1500,
      "description": "Grocery shopping",
      "isRecurring": false
    }
  ],
  "pagination": {
    "total": 250,
    "page": 1,
    "limit": 50,
    "pages": 5
  }
}
```

### POST /api/expenses
Add new expense.

**Request**:
```json
{
  "date": "2024-01-15",
  "category": "Food",
  "amount": 1500,
  "description": "Grocery shopping",
  "isRecurring": false
}
```

**Categories**: Food, Travel, Transport, Shopping, Bills, Entertainment, Healthcare, Education, Other

### POST /api/expenses/search
Natural language expense search.

**Request**:
```json
{
  "query": "show me food expenses in January 2024"
}
```

**Response** (200):
```json
{
  "query": "show me food expenses in January 2024",
  "count": 15,
  "total": 12500,
  "filters": "January 2024",
  "results": [...]
}
```

---

## Analytics APIs

### GET /api/analytics/dashboard
Get comprehensive dashboard statistics including income and expenses.

**Rate Limit**: 100 requests per minute

**Response** (200):
```json
{
  "totalExpenses": 125000,
  "totalIncome": 200000,
  "netBalance": 75000,
  "monthExpenses": 15000,
  "monthIncome": 50000,
  "monthNetBalance": 35000,
  "categoryCount": 8,
  "recentExpenseCount": 12,
  "recentIncomeCount": 2,
  "budgetCount": 5,
  "goalsCount": 3,
  "achievementsCount": 7
}
```

**Technical Note**: Uses MongoDB aggregation pipeline for efficient computation. Indexes on `userId` and `date` fields ensure O(log n) query performance.

### GET /api/analytics/predictions
Predict future expenses using weighted moving average.

**Query Parameters**:
- `months` (default: 3): Number of months to predict

**Response** (200):
```json
{
  "predictions": [
    {
      "month": "2024-02",
      "predictedAmount": 16500,
      "confidence": "medium"
    },
    {
      "month": "2024-03",
      "predictedAmount": 17325,
      "confidence": "medium"
    }
  ]
}
```

**Algorithm**: Weighted moving average with 5% monthly inflation adjustment. Confidence based on data variance.

---

## AI-Powered APIs

### POST /api/ai/chat
Conversational AI finance assistant with income-aware analysis.

**Rate Limit**: 20 requests per minute

**Request**:
```json
{
  "message": "Can I afford a ₹5000 purchase?"
}
```

**Response** (200):
```json
{
  "response": "💰 Affordability Analysis for ₹5000:\n\n📊 Current Month Status:\n• Income: ₹50000\n• Expenses: ₹15000\n• Current Balance: ₹35000\n• Days Remaining: 15\n\n✅ YES, you can afford it!\n\n💡 After Purchase:\n• Remaining Balance: ₹30000\n• Daily Budget: ₹2000 for 15 days"
}
```

**Features**:
- Rule-based responses for common queries (affordability, spending by category, net balance)
- LLM fallback with retry logic (3 attempts, exponential backoff)
- User-friendly error messages on AI service failure
- Context includes income, expenses, budgets, and goals

**Retry Logic**:
```javascript
// Exponential backoff: 1s, 2s, 4s
delay = min(initialDelay * 2^attempt, maxDelay)
```

### GET /api/budget-recommendations
AI-driven budget recommendations based on 3+ months of spending patterns.

**Rate Limit**: 20 requests per minute

**Response** (200):
```json
{
  "hasData": true,
  "monthsAnalyzed": 6,
  "totalRecommendedBudget": 45000,
  "avgMonthlyIncome": 50000,
  "recommendations": [
    {
      "category": "Food",
      "recommendedAmount": 12000,
      "currentAverage": 10500,
      "confidence": "high",
      "reasoning": "Based on 6 months of data, you spend an average of ₹10500 per month on Food. Your spending is consistent, so this budget should work well. This represents 24.0% of your average monthly income.",
      "dataPoints": 45,
      "monthsAnalyzed": 6
    }
  ]
}
```

**Insufficient Data Response**:
```json
{
  "hasData": false,
  "message": "You have 2 month(s) of data. We need at least 3 months of expense history to provide accurate budget recommendations. Keep tracking!",
  "recommendations": []
}
```

**Algorithm**:
1. Requires minimum 3 months of data
2. Calculates average monthly spending per category
3. Adds 15% buffer for variability
4. Confidence based on coefficient of variation (CV):
   - High: CV < 0.3
   - Medium: 0.3 ≤ CV < 0.6
   - Low: CV ≥ 0.6
5. Provides income-relative context

---

## Health Check API

### GET /api/health
Comprehensive system health check.

**Rate Limit**: None (public endpoint)

**Response** (200):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "services": {
    "backend": {
      "status": "up",
      "message": "Backend server is running"
    },
    "database": {
      "status": "up",
      "message": "MongoDB connected"
    },
    "ai": {
      "status": "configured",
      "message": "Groq API key configured"
    }
  }
}
```

**Status Codes**:
- 200: All services healthy
- 503: Degraded (one or more services down)

---

## Reports API

### GET /api/reports/pdf
Generate PDF financial report.

**Rate Limit**: 100 requests per minute

**Query Parameters**:
- `startDate`: Report start date (ISO 8601)
- `endDate`: Report end date (ISO 8601)

**Request**:
```bash
GET /api/reports/pdf?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response**: Binary PDF file

**Report Contents**:
1. Summary (total income, expenses, net balance)
2. Income summary by source
3. Expense summary by category
4. Detailed category breakdown
5. Pagination with page numbers

**Technical Implementation**:
- Uses PDFKit for server-side PDF generation
- Streams response directly to client
- Includes pagination and formatting
- Handles large datasets efficiently

---

## Technical Interview Topics

### 1. Authentication & Security
**Q**: How is authentication implemented?

**A**: JWT-based stateless authentication:
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- Middleware validates token on protected routes
- Rate limiting prevents brute force attacks (10 attempts per 15 min)

### 2. Database Design
**Q**: Explain the database schema and indexing strategy.

**A**: 
- **User isolation**: All queries filtered by `userId`
- **Compound indexes**: `{ userId: 1, date: -1 }` for time-series queries
- **Category index**: Enables fast category aggregations
- **Pagination**: Skip/limit pattern with total count
- **Validation**: Mongoose schemas enforce data integrity

### 3. Pagination Implementation
**Q**: Why pagination and how is it implemented?

**A**:
- **Performance**: Prevents loading thousands of records
- **Default limit**: 50 items (configurable)
- **Response format**: Includes total, page, limit, pages
- **MongoDB**: Uses `.skip()` and `.limit()` with indexes
- **Frontend**: Supports infinite scroll or page navigation

### 4. AI Integration
**Q**: How does the AI chatbot work?

**A**:
- **Hybrid approach**: Rule-based + LLM fallback
- **Rule-based**: Fast responses for common queries (affordability, spending)
- **LLM**: Groq API for complex queries
- **Retry logic**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Error handling**: User-friendly messages on failure
- **Context**: Includes income, expenses, budgets, goals

### 5. Budget Recommendations Algorithm
**Q**: Explain the budget recommendation logic.

**A**:
```javascript
// 1. Data validation
if (monthsOfData < 3) return insufficientDataMessage;

// 2. Calculate statistics
avgMonthly = totalSpending / monthsActive;
variance = Σ(amount - mean)² / n;
stdDev = √variance;
coefficientOfVariation = stdDev / mean;

// 3. Determine confidence
confidence = CV < 0.3 ? 'high' : CV < 0.6 ? 'medium' : 'low';

// 4. Add buffer
recommendedBudget = avgMonthly * 1.15; // 15% buffer

// 5. Provide reasoning
reasoning = `Based on ${monthsActive} months...`;
```

### 6. Analytics Performance
**Q**: How do you optimize dashboard queries?

**A**:
- **Aggregation pipeline**: Single query for multiple metrics
- **Indexes**: userId + date compound index
- **Caching**: Consider Redis for frequently accessed data
- **Projection**: Only select needed fields
- **Parallel queries**: Use Promise.all for independent queries

### 7. Rate Limiting Strategy
**Q**: Why different rate limits for different routes?

**A**:
- **Auth routes**: 10/15min (prevent brute force)
- **AI routes**: 20/min (expensive LLM calls)
- **API routes**: 100/min (normal operations)
- **Health check**: No limit (monitoring)

### 8. Error Handling
**Q**: How are errors handled across the stack?

**A**:
- **Backend**: Try-catch blocks, error middleware
- **AI failures**: Graceful degradation to rule-based responses
- **Network errors**: Axios interceptors with retry
- **User feedback**: Clear, actionable error messages
- **Logging**: Console errors with context

### 9. State Management
**Q**: Why Context API instead of Redux?

**A**:
- **Simplicity**: Fewer dependencies, less boilerplate
- **Performance**: Sufficient for app size
- **Separation**: Dedicated contexts (Auth, Expense, Income, Theme)
- **Scalability**: Can migrate to Redux if needed

### 10. Theme Implementation
**Q**: How is dark/light theme implemented?

**A**:
- **Context**: ThemeContext with localStorage persistence
- **CSS**: TailwindCSS dark mode classes
- **Persistence**: Saved to localStorage on change
- **Application**: document.documentElement.classList
- **Default**: Light theme on first visit

---

## Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AI Service (choose one)
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
AI_PROVIDER=groq

# Server
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Application

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Production Build
```bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build
npm run preview
```

---

## Testing Examples

### cURL Examples

**Register User**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test User"}'
```

**Add Income**:
```bash
curl -X POST http://localhost:5000/api/income \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"date":"2024-01-15","source":"Salary","amount":50000,"description":"Monthly salary"}'
```

**Get Budget Recommendations**:
```bash
curl -X GET http://localhost:5000/api/budget-recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Download PDF Report**:
```bash
curl -X GET "http://localhost:5000/api/reports/pdf?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output report.pdf
```

---

## Performance Considerations

1. **Database Indexes**: Compound indexes on userId + date
2. **Pagination**: Default 50 items, prevents memory issues
3. **Aggregation**: MongoDB pipeline for efficient analytics
4. **Rate Limiting**: Prevents abuse and ensures fair usage
5. **Retry Logic**: Exponential backoff for AI services
6. **Error Handling**: Graceful degradation on failures
7. **Caching**: Consider Redis for dashboard stats
8. **Connection Pooling**: MongoDB default connection pool

---

## Future Enhancements

1. **Caching Layer**: Redis for dashboard analytics
2. **WebSockets**: Real-time updates
3. **Batch Operations**: Bulk import/export
4. **Advanced Analytics**: Machine learning predictions
5. **Multi-currency**: Support for different currencies
6. **Notifications**: Email/SMS alerts for budget limits
7. **Collaboration**: Shared budgets for families
8. **Mobile App**: React Native implementation

---

## License
MIT License - See LICENSE file for details
