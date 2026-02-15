# Quick Start Guide

## For New Developers

### Prerequisites
```bash
node --version  # Should be 16+
npm --version   # Should be 8+
mongod --version # MongoDB installed
```

### 1. Clone & Install (5 minutes)

```bash
# Clone repository
git clone <repository-url>
cd smart-expense-tracker

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Setup Environment (2 minutes)

**Backend (.env):**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
PORT=5000
NODE_ENV=development
```

**Frontend (.env):**
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_AUTH_METHOD=backend
```

### 3. Start Development (1 minute)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 4. Test Application (2 minutes)

1. Open http://localhost:5173
2. Register new account
3. Add an expense
4. View dashboard

## Architecture Overview (2 minutes read)

### Request Flow
```
Client Request
    ↓
Route (routes/expenses.js)
    ↓
Controller (controllers/expenseController.js)
    ↓
Service (services/expenseService.js)
    ↓
Repository (repositories/expenseRepository.js)
    ↓
Model (models/Expense.js)
    ↓
MongoDB
```

### Key Concepts

**Controllers:** Handle HTTP requests
```javascript
exports.createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.userId, req.body);
  res.json({ success: true, data: expense });
});
```

**Services:** Business logic
```javascript
async createExpense(userId, data) {
  this.validateAmount(data.amount);
  return expenseRepository.create({ userId, ...data });
}
```

**Repositories:** Database operations
```javascript
async create(data) {
  return this.model.create(data);
}
```

## Common Tasks

### Add New Endpoint

1. **Create service method** (`services/expenseService.js`):
```javascript
async getExpenseById(userId, expenseId) {
  const expense = await expenseRepository.findByUserIdAndId(userId, expenseId);
  if (!expense) throw new NotFoundError('Expense');
  return expense;
}
```

2. **Create controller** (`controllers/expenseController.js`):
```javascript
exports.getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.userId, req.params.id);
  res.json({ success: true, data: expense });
});
```

3. **Add route** (`routes/expenses.js`):
```javascript
router.get('/:id', auth, validateObjectId(), expenseController.getExpenseById);
```

### Add Validation

In service layer:
```javascript
validateAmount(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) throw new ValidationError('Invalid amount');
  if (num < 0) throw new ValidationError('Amount cannot be negative');
  return num;
}
```

### Handle Errors

Use custom error classes:
```javascript
const { ValidationError, NotFoundError } = require('../utils/errors');

if (!data) throw new NotFoundError('Resource');
if (invalid) throw new ValidationError('Invalid input');
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/new-feature
```

### 2. Make Changes
- Update service layer first
- Then controller
- Then route
- Test manually

### 3. Test
```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

### 4. Commit
```bash
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

## Debugging

### Backend Issues

**Check logs:**
```bash
cd server
npm run dev
# Watch console output
```

**Test endpoint:**
```bash
curl http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Issues

**Check browser console:**
- Open DevTools (F12)
- Check Console tab
- Check Network tab

**Check API calls:**
```javascript
// In browser console
localStorage.getItem('token')
```

## Useful Commands

### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
mongosh              # Open MongoDB shell
use expense-tracker  # Switch to database
db.expenses.find()   # View expenses
```

## Project Structure Quick Reference

```
server/
├── config/          # Configuration
├── controllers/     # HTTP handlers
├── services/        # Business logic
├── repositories/    # Database access
├── models/          # Data schemas
├── routes/          # API routes
├── middleware/      # Custom middleware
└── utils/           # Helpers

client/
├── src/
│   ├── components/  # React components
│   ├── services/    # API calls
│   ├── context/     # State management
│   └── pages/       # Page components
```

## Getting Help

1. **Check documentation:**
   - REFACTORING_SUMMARY.md - Architecture
   - API_DOCUMENTATION.md - API reference
   - FOLDER_STRUCTURE.md - Project structure

2. **Common issues:**
   - MongoDB not running: `mongod`
   - Port in use: Change PORT in .env
   - CORS errors: Check CLIENT_URL in backend .env

3. **Ask for help:**
   - Create GitHub issue
   - Check existing issues
   - Review pull requests

## Next Steps

1. Read REFACTORING_SUMMARY.md for architecture details
2. Review API_DOCUMENTATION.md for API reference
3. Check FOLDER_STRUCTURE.md for project organization
4. Start building features!

## Tips

- Always use asyncHandler for async routes
- Throw custom errors (ValidationError, NotFoundError)
- Keep controllers thin
- Put business logic in services
- Use repositories for database access
- Test endpoints with Postman or curl
- Check browser console for frontend errors
- Use meaningful commit messages

Happy coding! 🚀
