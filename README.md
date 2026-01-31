# 💰 Smart Expense Tracker

A comprehensive MERN stack expense tracking application with AI-powered features, advanced security, and intelligent automation.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-green.svg)

---

## 🌟 Features

### Core Features
- 📊 **Expense & Income Tracking** - Track all your financial transactions
- 💳 **Budget Management** - Set and monitor budgets by category
- 🎯 **Financial Goals** - Create and track savings goals
- 📈 **Analytics Dashboard** - Visualize spending patterns with charts
- 📸 **OCR Receipt Scanning** - Extract data from receipt images
- 🤖 **AI Finance Assistant** - Get personalized financial advice
- 🏆 **Achievements System** - Gamified financial milestones
- 📄 **PDF Reports** - Generate detailed financial reports
- 🔐 **JWT Authentication** - Secure user authentication
- 🌐 **Google OAuth** - Quick sign-in with Google

### 🆕 Advanced Features (v2.0)

#### 🎤 Voice Input for Expenses
- Natural language voice commands
- Automatic extraction of amount, category, and description
- Manual editing before submission
- Confidence scoring
- **Example**: "Add 50 rupees grocery expense"

#### 🔒 Two-Factor Authentication (2FA)
- Email OTP support
- TOTP support (Google Authenticator)
- 10 backup codes for recovery
- Secure OTP storage with expiration
- Rate limiting protection

#### 🔍 Advanced Search & Filters
- Multi-criteria search (date, amount, category, payment mode)
- Quick filter presets (today, last 7 days, this month)
- Saved custom filters
- Real-time statistics
- Pagination support

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 5.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Setup

Create `server/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id

# Client URL
CLIENT_URL=http://localhost:5173

# Email Service (Optional - for 2FA)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourapp.com

# AI Service (Optional)
OPENAI_API_KEY=your-openai-api-key
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Database Setup

```bash
# Start MongoDB
mongod

# Create indexes (in MongoDB shell)
use expense-tracker

db.expenses.createIndex({ userId: 1, date: -1 })
db.expenses.createIndex({ userId: 1, category: 1 })
db.expenses.createIndex({ userId: 1, amount: 1 })
db.expenses.createIndex({ userId: 1, paymentMode: 1 })
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.savedfilters.createIndex({ userId: 1, name: 1 }, { unique: true })
```

### Run the Application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📁 Project Structure

```
smart-expense-tracker/
├── client/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Achievements.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── AdvancedSearch.jsx      # 🆕 Advanced search
│   │   │   ├── Budgets.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── ReceiptScanner.jsx
│   │   │   ├── Settings.jsx            # 🆕 Settings page
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TwoFactorSetup.jsx      # 🆕 2FA setup
│   │   │   ├── TwoFactorVerify.jsx     # 🆕 2FA verify
│   │   │   └── VoiceExpenseInput.jsx   # 🆕 Voice input
│   │   ├── context/            # React context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ExpenseContext.jsx
│   │   │   └── IncomeContext.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/           # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── expenseService.js
│   │   │   ├── voiceService.js         # 🆕 Voice service
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                      # Backend (Node.js + Express)
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rateLimiter.js
│   ├── models/                 # MongoDB models
│   │   ├── Achievement.js
│   │   ├── Budget.js
│   │   ├── Expense.js
│   │   ├── Goal.js
│   │   ├── Income.js
│   │   ├── OTP.js                      # 🆕 OTP model
│   │   ├── SavedFilter.js              # 🆕 Filter model
│   │   └── User.js
│   ├── routes/                 # API routes
│   │   ├── achievements.js
│   │   ├── ai.js
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── budgetRecommendations.js
│   │   ├── budgets.js
│   │   ├── expenses.js
│   │   ├── filters.js                  # 🆕 Search & filters
│   │   ├── goals.js
│   │   ├── health.js
│   │   ├── income.js
│   │   ├── receipts.js
│   │   ├── reports.js
│   │   ├── twoFactor.js                # 🆕 2FA
│   │   ├── users.js                    # 🆕 User preferences
│   │   └── voice.js                    # 🆕 Voice input
│   ├── utils/                  # Utility functions
│   │   ├── achievements.js
│   │   ├── analytics.js
│   │   ├── llmRetry.js
│   │   ├── nlp.js
│   │   ├── ocr.js
│   │   ├── twoFactor.js                # 🆕 2FA utilities
│   │   └── voiceParser.js              # 🆕 Voice parser
│   ├── package.json
│   └── server.js
│
├── docs/                        # 🆕 Documentation
│   ├── ADVANCED_FEATURES_DOCUMENTATION.md
│   ├── INTEGRATION_GUIDE.md
│   ├── FEATURES_SUMMARY.md
│   ├── INSTALL.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   └── NEW_FEATURES_README.md
│
├── API_DOCUMENTATION.md
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **date-fns** - Date utilities
- **Web Speech API** - Voice recognition 🆕

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google OAuth** - Social login
- **Tesseract.js** - OCR
- **Multer** - File uploads
- **PDFKit** - PDF generation
- **Speakeasy** - TOTP generation 🆕
- **QRCode** - QR code generation 🆕
- **Compromise** - NLP parsing 🆕

---

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-2fa` - Verify 2FA code 🆕

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Income
- `GET /api/income` - Get all income
- `POST /api/income` - Create income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Analytics
- `GET /api/analytics/summary` - Get financial summary
- `GET /api/analytics/trends` - Get spending trends
- `GET /api/analytics/category-breakdown` - Category analysis

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/budget-recommendations` - Get budget recommendations

### Receipts
- `POST /api/receipts/scan` - Scan receipt with OCR

### Reports
- `GET /api/reports/generate` - Generate PDF report

### 🆕 Voice Input
- `POST /api/voice/parse` - Parse voice transcript
- `POST /api/voice/expense` - Create expense from voice

### 🆕 Two-Factor Authentication
- `GET /api/2fa/status` - Get 2FA status
- `POST /api/2fa/setup/email` - Setup email 2FA
- `POST /api/2fa/setup/totp` - Setup TOTP 2FA
- `POST /api/2fa/verify/email` - Verify email 2FA
- `POST /api/2fa/verify/totp` - Verify TOTP 2FA
- `POST /api/2fa/disable` - Disable 2FA
- `POST /api/2fa/regenerate-backup-codes` - Regenerate backup codes

### 🆕 User Settings
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile

### 🆕 Advanced Search
- `POST /api/filters/search` - Advanced search
- `GET /api/filters/quick/:preset` - Quick filters
- `GET /api/filters` - Get saved filters
- `POST /api/filters` - Create saved filter
- `PUT /api/filters/:id` - Update filter
- `DELETE /api/filters/:id` - Delete filter

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 🎯 Usage Examples

### Voice Input
```javascript
// User speaks: "Add 50 rupees grocery expense"
// System automatically:
// - Extracts amount: 50
// - Detects category: Food
// - Creates description: "Grocery expense"
```

### 2FA Setup
```javascript
// Email OTP
1. Go to Settings → Security
2. Click "Enable 2FA"
3. Choose "Email OTP"
4. Enter code from email
5. Save backup codes

// Google Authenticator
1. Go to Settings → Security
2. Click "Enable 2FA"
3. Choose "Authenticator App"
4. Scan QR code with Google Authenticator
5. Enter 6-digit code
6. Save backup codes
```

### Advanced Search
```javascript
// Search expenses
- Date: Last 30 days
- Amount: ₹100 - ₹5000
- Category: Food, Shopping
- Payment: Card, UPI
- Text: "restaurant"

// Save filter as "Monthly Dining"
// Load anytime with one click
```

---

## 🔒 Security Features

- ✅ JWT authentication with secure tokens
- ✅ Password hashing with bcryptjs
- ✅ Two-factor authentication (Email OTP + TOTP)
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ XSS protection
- ✅ NoSQL injection prevention
- ✅ CORS configuration
- ✅ Encrypted TOTP secrets
- ✅ OTP auto-expiration
- ✅ One-time backup codes
- ✅ HTTPS required in production

---

## 📊 Database Schema

### User
```javascript
{
  email: String,
  password: String (hashed),
  fullName: String,
  picture: String,
  googleId: String,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String (encrypted),
  twoFactorMethod: 'email' | 'totp',
  twoFactorBackupCodes: [{ code: String, used: Boolean }]
}
```

### Expense
```javascript
{
  userId: ObjectId,
  date: Date,
  category: String,
  amount: Number,
  description: String,
  paymentMode: String,
  tags: [String],
  isRecurring: Boolean,
  receiptImage: String
}
```

For complete schema documentation, see [ADVANCED_FEATURES_DOCUMENTATION.md](docs/ADVANCED_FEATURES_DOCUMENTATION.md)

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Google OAuth login
- [ ] 2FA setup and verification
- [ ] Voice input expense creation
- [ ] Advanced search with filters
- [ ] Expense CRUD operations
- [ ] Budget management
- [ ] Goal tracking
- [ ] Analytics dashboard
- [ ] Receipt scanning
- [ ] PDF report generation

---

## 📱 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core Features | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ⚠️ | ✅ | ✅ |
| 2FA | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |

✅ Full support | ⚠️ Limited support | ❌ Not supported

**Note**: Voice input requires HTTPS in production and microphone permissions.

---

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd client
npm run build

# The build folder is ready to be deployed
```

### Environment Variables (Production)

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
CLIENT_URL=https://yourapp.com
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourapp.com
```

### Deployment Platforms

- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, DigitalOcean, Render
- **Database**: MongoDB Atlas, AWS DocumentDB

For detailed deployment instructions, see [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)

---

## 📖 Documentation

### Complete Documentation
- **[INSTALL.md](docs/INSTALL.md)** - Installation instructions
- **[INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)** - Step-by-step integration
- **[ADVANCED_FEATURES_DOCUMENTATION.md](docs/ADVANCED_FEATURES_DOCUMENTATION.md)** - Technical details
- **[FEATURES_SUMMARY.md](docs/FEATURES_SUMMARY.md)** - Feature overview
- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Deployment guide
- **[NEW_FEATURES_README.md](docs/NEW_FEATURES_README.md)** - User documentation
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code patterns
- Add tests for new features
- Update documentation
- Ensure security best practices
- Test across browsers

---

## 🐛 Troubleshooting

### Common Issues

**Voice input not working**
```
Solution: Ensure HTTPS in production, grant microphone permission, use Chrome/Safari
```

**2FA OTP not received**
```
Solution: Check server console (dev mode), verify SENDGRID_API_KEY, check spam folder
```

**MongoDB connection error**
```
Solution: Verify MONGODB_URI in .env, check MongoDB is running, verify network
```

**Search performance slow**
```
Solution: Create MongoDB indexes, check database size, add pagination
```

For more troubleshooting, see [INSTALL.md](docs/INSTALL.md)

---

## 📝 Changelog

### Version 2.0.0 (Current)
- ✨ Added Voice Input for Expenses
- ✨ Added Two-Factor Authentication (Email OTP + TOTP)
- ✨ Added Advanced Search & Filters (multi-criteria + saved filters)
- 🔒 Enhanced security features
- ⚡ Performance optimizations
- 📚 Comprehensive documentation
- 🐛 Bug fixes and improvements

### Version 1.0.0
- 📊 Expense & Income tracking
- 💳 Budget management
- 🎯 Financial goals
- 📈 Analytics dashboard
- 📸 OCR receipt scanning
- 🤖 AI finance assistant
- 🏆 Achievements system
- 📄 PDF reports
- 🔐 JWT authentication
- 🌐 Google OAuth

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- Tailwind CSS for the styling system
- Chart.js for data visualization
- Tesseract.js for OCR capabilities
- Speakeasy for TOTP implementation
- All open-source contributors

---

## 📞 Support

For support, email support@yourapp.com or join our Slack channel.

---

## 🔗 Links

- **Live Demo**: [https://yourapp.com](https://yourapp.com)
- **Documentation**: [https://docs.yourapp.com](https://docs.yourapp.com)
- **API Reference**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **GitHub**: [https://github.com/yourusername/smart-expense-tracker](https://github.com/yourusername/smart-expense-tracker)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

## 📊 Project Stats

- **Total Files**: 100+
- **Total Lines of Code**: 15,000+
- **API Endpoints**: 50+
- **React Components**: 30+
- **Database Models**: 10+
- **Documentation Pages**: 7

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Bank account integration
- [ ] Cryptocurrency tracking
- [ ] Investment portfolio tracking
- [ ] Bill reminders and notifications
- [ ] Shared budgets for families
- [ ] Export to Excel/CSV
- [ ] Recurring expense automation
- [ ] Machine learning predictions

---

## 💡 Tips & Best Practices

### For Users
- Enable 2FA for enhanced security (Settings → Security)
- Use voice input for quick expense entry (Expenses page)
- Use advanced search to analyze spending (Expenses page)
- Set realistic budgets and goals
- Scan receipts for accurate tracking
- Check analytics regularly

### For Developers
- Follow the existing code structure
- Write tests for new features
- Update documentation
- Use environment variables
- Implement proper error handling
- Follow security best practices
- Optimize database queries

---

<div align="center">

**Built with ❤️ using MERN Stack**

[⬆ Back to Top](#-smart-expense-tracker)

</div>
