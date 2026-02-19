# 💰 Smart Expense Tracker

A modern, full-stack MERN application for tracking expenses, managing budgets, and gaining financial insights with AI-powered features.

## 🚀 Features

### 💸 Expense Management
- Add, edit, and delete expenses
- Category-based organization
- Receipt scanning with OCR
- Voice input for quick entry
- Advanced search and filters
- Recurring expense tracking
- Export to Excel/CSV/PDF

### 💰 Income Tracking
- Track multiple income sources
- Monthly income summaries
- Income vs expenses comparison
- Recurring income support

### � Budget Management
- Set category-based budgets
- Real-time budget tracking
- Overspending alerts
- AI-powered budget recommendations
- Visual progress indicators

### 🎯 Financial Goals
- Create and track savings goals
- Progress visualization
- Deadline reminders
- Goal completion celebrations

### 📈 Analytics & Insights
- Interactive dashboard
- Spending patterns analysis
- Category breakdown charts
- Spending trends over time
- Calendar heatmap
- Financial health score

### 🤖 AI Assistant
- Natural language chat interface
- Smart expense categorization
- Personalized financial advice
- Budget recommendations
- Spending analysis

### 🏆 Gamification
- Achievement badges
- Milestone tracking
- Progress rewards
- Motivational system

### � Progressive Web App (PWA)
- Offline functionality
- Install on any device
- Background sync
- Push notifications
- Fast and responsive

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Firebase (optional)
- **AI**: Groq API (Llama 3.3)
- **OCR**: Tesseract.jsInstall as app with offline functionality
- **📄 Data Export** - Export to Excel, CSV, JSON, and PDF formats
- **🔐 Biometric Auth** - Fingerprint and Face ID support
- **🗓️ Spending Heatmap** - Calendar view with day-of-week analysis
- **💡 Budget Recommendations** - AI-powered budget suggestions

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt, Rate Limiting, Input Validation
- **AI**: Groq AI API
- **OCR**: Tesseract.js
- **PDF Generation**: PDFKit

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios

### DevOps
- **Version Control**: Git
- **Backend Hosting**: Render
- **Frontend Hosting**: Vercel
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions (planned)

---

## 🏗️ Architecture

### Clean Layered Architecture

```
┌─────────────────────────────────────────┐
│           Client (React)                │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│         Routes Layer                    │
│  (API Endpoints & Middleware)           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Controllers Layer                 │
│  (Request/Response Handling)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Services Layer                   │
│  (Business Logic & Validation)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Repositories Layer                 │
│  (Database Operations)                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Models Layer                    │
│  (Data Schemas & Validation)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         MongoDB Database                │
└─────────────────────────────────────────┘
```

### Design Patterns

- **Repository Pattern** - Abstraction over data access
- **Service Layer Pattern** - Business logic separation
- **Dependency Injection** - Loose coupling
- **Factory Pattern** - Object creation
- **Singleton Pattern** - Database connections

---

## 📦 Installation

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 4.4

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables** (see [Configuration](#-configuration))

5. **Start MongoDB**
```bash
mongod
```

6. **Run the application**

Terminal 1 (server):
```bash
cd server
npm run dev
```

Terminal 2 (client):
```bash
cd client
npm run dev
```

7. **Open your browser**
```
http://localhost:5173
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# AI Service (Optional)
GROQ_API_KEY=your_groq_api_key

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend Environment Variables

Create `client/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Authentication Method
VITE_AUTH_METHOD=backend

# Firebase (Optional - for additional auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## 🚀 Usage

### User Registration

1. Navigate to the registration page
2. Enter email, password, and full name
3. Click "Register"
4. You'll be automatically logged in

### Adding Expenses

1. Click "Add Expense" button
2. Fill in the details:
   - Date
   - Category
   - Amount
   - Description
   - Payment mode
3. Click "Save"

### Setting Budgets

1. Go to "Budgets" page
2. Click "Set Budget"
3. Select category and enter monthly limit
4. Track your spending against the budget

### Using AI Assistant

1. Click on the AI Assistant icon
2. Ask questions like:
   - "How much did I spend on food this month?"
   - "Give me tips to save money"
   - "Analyze my spending patterns"

### Scanning Receipts

1. Click "Scan Receipt"
2. Upload or capture receipt image
3. Review extracted data
4. Confirm and save

---

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
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

#### Expenses
- `GET /expenses` - Get all expenses (paginated)
- `POST /expenses` - Create expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `GET /expenses/summary` - Get expense summary

#### Budgets
- `GET /budgets` - Get all budgets
- `POST /budgets` - Set budget
- `DELETE /budgets/:category` - Delete budget

#### Analytics
- `GET /analytics/dashboard` - Get dashboard data
- `GET /analytics/heatmap` - Get spending heatmap
- `GET /analytics/patterns` - Get spending patterns

For complete API documentation, see [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## 📁 Project Structure

```
smart-expense-tracker/
├── client/                      # React Frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── common/          # Reusable components
│   │   │   ├── features/        # Feature-specific components
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # UI components
│   │   ├── context/             # React Context (state management)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service calls
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main App component
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Environment variables
│   ├── package.json             # Dependencies
│   └── vite.config.js           # Vite configuration
│
├── server/                      # Node.js Backend
│   ├── config/                  # Configuration files
│   │   ├── database.js          # Database connection
│   │   └── env.js               # Environment validation
│   ├── controllers/             # Request handlers
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── budgetController.js
│   │   └── ...
│   ├── services/                # Business logic
│   │   ├── authService.js
│   │   ├── expenseService.js
│   │   └── ...
│   ├── repositories/            # Data access layer
│   │   ├── expenseRepository.js
│   │   ├── budgetRepository.js
│   │   └── ...
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Budget.js
│   │   └── ...
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   └── ...
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js              # Authentication
│   │   ├── errorHandler.js      # Error handling
│   │   └── validation.js        # Input validation
│   ├── utils/                   # Utility functions
│   │   ├── errors.js            # Custom error classes
│   │   └── asyncHandler.js      # Async wrapper
│   ├── .env                     # Environment variables
│   ├── package.json             # Dependencies
│   └── server.js                # Entry point
│
├── docs/                        # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── FOLDER_STRUCTURE.md
│   ├── PROJECT_SUMMARY.md
│   └── QUICK_START.md
│
├── .gitignore
├── LICENSE
├── README.md
└── render.yaml                  # Render deployment config
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Expense Tracking
![Expenses](docs/screenshots/expenses.png)

### Budget Management
![Budgets](docs/screenshots/budgets.png)

### Analytics & Heatmap
![Analytics](docs/screenshots/analytics.png)

---

## 🌐 Deployment

### Backend (Render)

1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
5. Add environment variables
6. Deploy

### Frontend (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables
5. Deploy

### Database (MongoDB Atlas)

1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGODB_URI` in environment variables

For detailed deployment instructions, see [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Keep code DRY and SOLID

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/smart-expense-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/smart-expense-tracker/discussions)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend library
- [Express](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Charts
- [Groq AI](https://groq.com/) - AI assistant
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR

---

## 📊 Project Stats

- **Lines of Code**: 15,000+
- **API Endpoints**: 50+
- **Features**: 15+
- **Components**: 40+
- **Test Coverage**: Ready for 80%+

---

## 🎯 Roadmap

### Phase 1 (Completed ✅)
- [x] Core expense tracking
- [x] Budget management
- [x] Analytics dashboard
- [x] AI assistant
- [x] Receipt scanning
- [x] PWA support

### Phase 2 (In Progress 🚧)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Mobile app (React Native)
- [ ] Advanced analytics

### Phase 3 (Planned 📋)
- [ ] Multi-currency support
- [ ] Team collaboration
- [ ] Investment tracking
- [ ] Tax calculations

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Sarth00718](https://github.com/Sarth00718)
- Email: sarthnaola018@gmail.com

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**Built using MERN Stack**

[⬆ Back to Top](#-smart-expense-tracker)

</div>


