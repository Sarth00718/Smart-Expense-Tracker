# Quick Start Guide - Smart Expense Tracker

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection string ready
- Terminal/Command Prompt

### Step 1: Install Dependencies

**Backend**:
```bash
cd server
npm install
```

**Frontend**:
```bash
cd client
npm install
```

### Step 2: Configure Environment Variables

**Backend** (`server/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional: For AI features
GROQ_API_KEY=your-groq-api-key-here
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB

Make sure MongoDB is running:
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

### Step 4: Start the Application

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
```
You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev
```
You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### Step 5: Access the Application

Open your browser and go to: **http://localhost:5173**

## 📝 First Time Setup

### 1. Register an Account
- Click "Register" on the login page
- Enter your email, password, and full name
- Click "Create Account"

### 2. Add Your First Income
- Navigate to "Income" in the sidebar
- Click "+ Add Income"
- Fill in:
  - Date: Today's date
  - Source: Salary
  - Amount: 50000
  - Description: Monthly salary
- Click "Add Income"

### 3. Add Your First Expense
- Go to "Dashboard" (home)
- Use the quick add form:
  - Date: Today
  - Category: Food
  - Amount: 500
  - Description: Lunch
- Click "Add Expense"

### 4. Explore Features

**Dashboard**: View income, expenses, net balance, and category breakdown

**Expenses**: Full expense management with pagination

**Income**: Track all income sources

**Budgets**: Set monthly budgets per category

**Budget AI**: Get AI recommendations (needs 3+ months of data)

**Goals**: Create savings goals

**Analytics**: View trends and predictions

**AI Assistant**: Chat about your finances

**Achievements**: Earn badges for tracking

**Spending Heatmap**: Visual calendar of spending

**Receipt Scanner**: Extract data from receipt images

## 🎯 Testing the New Features

### Income Module
1. Go to "Income" page
2. Add multiple income entries with different sources
3. Check the summary cards update
4. Test pagination by adding 50+ entries
5. Edit and delete entries

### Budget Recommendations
1. Add expenses for at least 3 months (or use past dates)
2. Navigate to "Budget AI"
3. View AI-generated recommendations
4. Check confidence levels and reasoning

### Income-Aware Analytics
1. Add both income and expenses
2. Go to Dashboard
3. Verify "Net Balance" shows income - expenses
4. Check "This Month Net" calculation

### AI Chat with Income
1. Go to "AI Assistant"
2. Ask: "What's my net balance?"
3. Ask: "Can I afford a ₹5000 purchase?"
4. Verify responses include income data

### PDF Reports
1. Add some income and expenses
2. Use the export feature (if UI button exists)
3. Or call API directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/reports/pdf?startDate=2024-01-01&endDate=2024-01-31" \
     --output report.pdf
   ```

### Health Check
Visit: http://localhost:5000/api/health

Should return:
```json
{
  "status": "healthy",
  "services": {
    "backend": { "status": "up" },
    "database": { "status": "up" },
    "ai": { "status": "configured" }
  }
}
```

## 🐛 Troubleshooting

### Backend won't start
- **Error**: `MONGODB_URI not found`
  - Solution: Create `server/.env` file with MongoDB connection string

- **Error**: `Port 5000 already in use`
  - Solution: Change PORT in `.env` or kill the process using port 5000

### Frontend won't start
- **Error**: `Cannot connect to backend`
  - Solution: Ensure backend is running on port 5000
  - Check `VITE_API_URL` in `client/.env`

### MongoDB connection failed
- **Error**: `MongoServerError: connect ECONNREFUSED`
  - Solution: Start MongoDB service
  - Verify connection string in `.env`

### AI features not working
- **Error**: `AI service not configured`
  - Solution: Add `GROQ_API_KEY` to `server/.env`
  - Get free API key from: https://console.groq.com

### Expenses not loading
- **Error**: `expenses.reduce is not a function`
  - Solution: Already fixed in latest code
  - Pull latest changes and restart

## 📊 Sample Data for Testing

### Quick Test Data Script

Create a file `server/seedData.js`:
```javascript
const mongoose = require('mongoose');
const Income = require('./models/Income');
const Expense = require('./models/Expense');

async function seedData(userId) {
  // Add 6 months of income
  const incomes = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    incomes.push({
      userId,
      date,
      source: 'Salary',
      amount: 50000,
      description: 'Monthly salary',
      isRecurring: true
    });
  }
  await Income.insertMany(incomes);

  // Add expenses
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'];
  const expenses = [];
  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));
    expenses.push({
      userId,
      date,
      category: categories[Math.floor(Math.random() * categories.length)],
      amount: Math.floor(Math.random() * 5000) + 100,
      description: 'Test expense'
    });
  }
  await Expense.insertMany(expenses);

  console.log('✅ Sample data added!');
}

// Run: node seedData.js YOUR_USER_ID
```

## 🎓 API Testing with Postman/cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Add Income
```bash
curl -X POST http://localhost:5000/api/income \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"date":"2024-01-15","source":"Salary","amount":50000}'
```

### Get Budget Recommendations
```bash
curl http://localhost:5000/api/budget-recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Next Steps

1. **Explore the codebase**: Check `API_DOCUMENTATION.md` for detailed API reference
2. **Read implementation details**: See `IMPLEMENTATION_SUMMARY.md`
3. **Customize**: Modify categories, sources, or add new features
4. **Deploy**: Follow deployment guides for Render/Vercel

## 🆘 Need Help?

- Check `API_DOCUMENTATION.md` for API details
- Review `IMPLEMENTATION_SUMMARY.md` for architecture
- See `FIXES_APPLIED.md` for recent bug fixes
- Open an issue on GitHub

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] User registered and logged in
- [ ] Income added successfully
- [ ] Expenses added successfully
- [ ] Dashboard shows net balance
- [ ] All sidebar links work
- [ ] AI chat responds
- [ ] Budget recommendations load (with 3+ months data)

**Happy tracking! 💰📊**
