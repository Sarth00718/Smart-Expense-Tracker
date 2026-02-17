# Project Folder Structure

## Complete Structure

```
smart-expense-tracker/
│
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Reusable components
│   │   │   ├── features/            # Feature-specific components
│   │   │   │   ├── expenses/
│   │   │   │   ├── income/
│   │   │   │   ├── budgets/
│   │   │   │   ├── goals/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   ├── layout/              # Layout components
│   │   │   └── ui/                  # UI components
│   │   ├── config/                  # Configuration files
│   │   ├── context/                 # React Context providers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API service layer
│   │   └── utils/                   # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend Node.js Application
│   ├── config/                      # ⭐ NEW: Configuration
│   │   ├── database.js              # MongoDB connection management
│   │   └── env.js                   # Environment validation
│   │
│   ├── controllers/                 # ⭐ REFACTORED: Request handlers
│   │   ├── authController.js        # Authentication endpoints
│   │   ├── expenseController.js     # Expense endpoints
│   │   ├── incomeController.js      # Income endpoints
│   │   ├── budgetController.js      # Budget endpoints
│   │   ├── goalController.js        # Goal endpoints
│   │   ├── analyticsController.js   # Analytics endpoints
│   │   └── achievementController.js # Achievement endpoints
│   │
│   ├── services/                    # ⭐ NEW: Business logic layer
│   │   ├── authService.js           # Authentication logic
│   │   ├── expenseService.js        # Expense business logic
│   │   ├── incomeService.js         # Income business logic
│   │   └── budgetService.js         # Budget business logic
│   │
│   ├── repositories/                # ⭐ NEW: Data access layer
│   │   ├── baseRepository.js        # Generic CRUD operations
│   │   ├── userRepository.js        # User data access
│   │   ├── expenseRepository.js     # Expense data access
│   │   ├── incomeRepository.js      # Income data access
│   │   └── budgetRepository.js      # Budget data access
│   │
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   ├── Budget.js
│   │   ├── Goal.js
│   │   └── Achievement.js
│   │
│   ├── routes/                      # Express routes
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── income.js
│   │   ├── budgets.js
│   │   ├── goals.js
│   │   ├── analytics.js
│   │   └── achievements.js
│   │
│   ├── middleware/                  # Custom middleware
│   │   ├── asyncHandler.js          # ⭐ NEW: Async error wrapper
│   │   ├── errorHandler.js          # ⭐ NEW: Centralized errors
│   │   ├── auth.js                  # JWT authentication
│   │   ├── security.js              # Security headers
│   │   ├── rateLimiter.js           # Rate limiting
│   │   └── validateObjectId.js      # MongoDB ID validation
│   │
│   ├── utils/                       # Utility functions
│   │   ├── errors.js                # ⭐ NEW: Custom error classes
│   │   ├── achievements.js          # Achievement logic
│   │   ├── analytics.js             # Analytics calculations
│   │   ├── nlp.js                   # Natural language processing
│   │   ├── ocr.js                   # Receipt scanning
│   │   └── validation.js            # Validation helpers
│   │
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Environment template
│   ├── package.json
│   └── server.js                    # ⭐ REFACTORED: Entry point
│
├── docs/                            # Documentation
│   ├── API_DOCUMENTATION.md         # API reference
│   ├── DEPLOYMENT_GUIDE.md          # Deployment instructions
│   ├── FOLDER_STRUCTURE.md          # This file
│   ├── PROJECT_SUMMARY.md           # Project overview
│   └── QUICK_START.md               # Quick start guide
│
├── .gitignore
├── LICENSE
├── README.md                        # Main documentation
└── render.yaml                      # Render deployment config
```

## Layer Responsibilities

### 1. Routes Layer (`routes/`)
**Purpose:** Define API endpoints and bind middleware

**Responsibilities:**
- Define HTTP methods and paths
- Apply middleware (auth, validation)
- Route to appropriate controller

**Example:**
```javascript
router.post('/', auth, expenseController.createExpense);
```

### 2. Controllers Layer (`controllers/`)
**Purpose:** Handle HTTP requests and responses

**Responsibilities:**
- Extract data from request
- Call service layer
- Format and send response
- Handle HTTP-specific logic

**Example:**
```javascript
exports.createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.userId, req.body);
  res.status(201).json({ success: true, data: expense });
});
```

### 3. Services Layer (`services/`)
**Purpose:** Implement business logic

**Responsibilities:**
- Validate business rules
- Coordinate between repositories
- Implement complex operations
- Handle transactions

**Example:**
```javascript
async createExpense(userId, data) {
  this.validateAmount(data.amount);
  return expenseRepository.create({ userId, ...data });
}
```

### 4. Repositories Layer (`repositories/`)
**Purpose:** Abstract database operations

**Responsibilities:**
- CRUD operations
- Database queries
- Aggregations
- Data access patterns

**Example:**
```javascript
async findByUserId(userId, options) {
  return this.find({ userId }, options);
}
```

### 5. Models Layer (`models/`)
**Purpose:** Define data structure

**Responsibilities:**
- Schema definition
- Validation rules
- Indexes
- Instance methods

## Configuration Files

### Backend
- `server/.env` - Environment variables
- `server/config/env.js` - Configuration management
- `server/config/database.js` - Database connection

### Frontend
- `client/.env` - Environment variables
- `client/vite.config.js` - Vite configuration
- `client/tailwind.config.js` - Tailwind CSS config

## Key Directories

### `/config` - Configuration
Centralized configuration and environment management

### `/services` - Business Logic
Core business logic isolated from HTTP and database concerns

### `/repositories` - Data Access
Database operations abstracted from business logic

### `/middleware` - Request Processing
Reusable middleware for authentication, validation, error handling

### `/utils` - Helpers
Utility functions and helper methods

## File Naming Conventions

- **Controllers:** `*Controller.js` (e.g., `expenseController.js`)
- **Services:** `*Service.js` (e.g., `expenseService.js`)
- **Repositories:** `*Repository.js` (e.g., `expenseRepository.js`)
- **Models:** PascalCase (e.g., `Expense.js`)
- **Routes:** lowercase (e.g., `expenses.js`)
- **Middleware:** camelCase (e.g., `asyncHandler.js`)

## Import Patterns

### Controllers
```javascript
const expenseService = require('../services/expenseService');
const asyncHandler = require('../middleware/asyncHandler');
```

### Services
```javascript
const expenseRepository = require('../repositories/expenseRepository');
const { ValidationError } = require('../utils/errors');
```

### Repositories
```javascript
const BaseRepository = require('./baseRepository');
const Expense = require('../models/Expense');
```

## Benefits of This Structure

1. **Separation of Concerns:** Each layer has a single responsibility
2. **Testability:** Services and repositories can be tested independently
3. **Maintainability:** Easy to locate and modify code
4. **Scalability:** Easy to add new features
5. **Reusability:** Services can be reused across different interfaces
6. **Clarity:** Clear data flow through layers
