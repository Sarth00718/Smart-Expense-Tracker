# 💰 Smart Expense Tracker - MERN Stack

A comprehensive full-stack expense tracking application built with MongoDB, Express, React, and Node.js, featuring AI-powered insights, receipt scanning, and advanced analytics.

## ✨ Features

### 🎯 Core Features
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Budget Planning**: Set monthly budgets and track spending
- **Savings Goals**: Create and monitor savings targets
- **Dashboard Analytics**: Comprehensive spending statistics and visualizations

### 🤖 AI-Powered Features
- **Conversational Finance Bot**: ChatGPT-like interface to ask questions about your finances
  - "How much did I spend on food last month?"
  - "Can I afford a ₹5,000 phone this month?"
  - "What are my top spending categories?"
  - "Show me my recent expenses"
- **Smart Suggestions**: AI-powered saving tips based on spending patterns
- **Behavioral Analysis**: Detect spending patterns and impulse buying
- **Future Predictions**: Predict future expenses based on historical data
- **Spending Score**: Financial health scoring system
- **Affordability Analysis**: Get instant answers on whether you can afford purchases

### 📊 Advanced Analytics
- **Calendar Heatmap**: Visual spending patterns by date
- **Category Breakdown**: Detailed spending analysis by category
- **Trend Visualization**: Monthly and weekly spending trends
- **Achievement System**: Gamified expense tracking with badges

### 🔧 Technical Features
- **Receipt Scanning**: OCR-powered receipt text extraction
- **Natural Language Search**: Search expenses using natural language
- **Data Export**: Export data to Excel format
- **Google OAuth**: Social login integration
- **Responsive Design**: Mobile-first, fully responsive UI

## 🤖 Conversational Finance Bot

The app includes a ChatGPT-like AI assistant that understands natural language queries about your finances.

### Example Questions You Can Ask:

**Spending Queries:**
- "How much did I spend on food last month?"
- "What did I spend on shopping this week?"
- "Show me my travel expenses"

**Affordability Analysis:**
- "Can I afford a ₹5,000 phone this month?"
- "Can I buy a ₹2,000 gadget?"
- "Should I make a ₹10,000 purchase?"

**Analytics:**
- "What are my top spending categories?"
- "Show me my recent expenses"
- "What's my total spending this month?"

### How It Works:

1. **Rule-Based Engine**: For common queries, the bot uses fast NLP pattern matching
2. **LLM Integration**: For complex questions, it uses Groq's Llama 3.1 model
3. **Context-Aware**: Analyzes your actual expense data, budgets, and goals
4. **Instant Responses**: Get answers in seconds with specific numbers and actionable advice

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 5.0+

### Installation

1. **Clone and Navigate**
   ```bash
   cd expense-tracker-mern
   ```

2. **Install Dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_secure_jwt_secret
   GROQ_API_KEY=your_groq_api_key (optional)
   GOOGLE_CLIENT_ID=your_google_client_id (optional)
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
expense-tracker-mern/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Configuration files
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
├── client/                # Frontend (React)
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Context API
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Main App component
│   │   └── index.js      # Entry point
│   └── package.json
├── package.json
├── .env.example
└── README.md
```

## 🔧 Configuration

### Required Configuration
- **MONGODB_URI**: MongoDB connection string
- **JWT_SECRET**: Secure secret for JWT token signing

### Optional Configuration
- **GROQ_API_KEY**: For AI-powered suggestions and insights
- **GOOGLE_CLIENT_ID**: For Google OAuth login

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Expenses
- `POST /api/expenses` - Add expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/filter` - Filter expenses
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets
- `POST /api/budgets` - Set budget
- `GET /api/budgets` - Get all budgets
- `DELETE /api/budgets/:category` - Delete budget

### Goals
- `POST /api/goals` - Add savings goal
- `GET /api/goals` - Get all goals
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/heatmap` - Calendar heatmap
- `GET /api/analytics/patterns` - Behavioral patterns
- `GET /api/analytics/predictions` - Future predictions
- `GET /api/analytics/score` - Spending score

### AI
- `GET /api/ai/suggestions` - Get AI financial suggestions
- `POST /api/ai/chat` - Chat with AI Finance Bot (conversational interface)

### Achievements
- `GET /api/achievements` - Get user achievements

## 🎯 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Context API** - State management
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **React-Chartjs-2** - Chart.js wrapper
- **XLSX** - Excel export
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Tesseract.js** - OCR
- **Google Auth Library** - OAuth

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configured for secure cross-origin requests
- **Environment Variables**: Sensitive data in .env files

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
NODE_ENV=production node server/server.js
```

## 📈 Performance

- **MongoDB Indexing**: Optimized queries with proper indexes
- **React Optimization**: Memoization and lazy loading
- **API Caching**: Response caching for frequent operations
- **Code Splitting**: Reduced initial bundle size

## 🚀 Deployment

### Deploy to Production

#### Backend (Render.com)
1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service
4. Set Root Directory: `server`
5. Add environment variables (see `render.yaml`)
6. Deploy and copy backend URL

#### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set Root Directory: `client`
4. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.onrender.com/api`
5. Deploy

See `VERCEL-DEPLOYMENT.md` for detailed instructions.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env

2. **Port Already in Use**
   - Change PORT in .env
   - Kill process using the port

3. **AI Suggestions Not Working**
   - Add valid GROQ_API_KEY to .env
   - Check API key credits

4. **Vercel Deployment Error**
   - Set Root Directory to `client` in Vercel dashboard
   - Ensure VITE_API_URL is set in environment variables
   - Deploy backend first before frontend

5. **Network Error on Login**
   - Backend not running or not deployed
   - Check VITE_API_URL points to correct backend
   - Verify CORS settings in backend

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🆘 Support

For issues and questions, please open an issue on GitHub.

---

**Happy expense tracking! 💰📊**
