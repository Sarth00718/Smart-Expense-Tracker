# Smart Expense Tracker - Frontend

Modern React PWA built with Vite, Tailwind CSS, and Framer Motion.

## 🚀 Features

- ✅ Modern React 18 with Hooks
- ✅ Vite for lightning-fast development
- ✅ Tailwind CSS for styling
- ✅ Framer Motion for animations
- ✅ Progressive Web App (PWA) support
- ✅ Offline functionality
- ✅ Firebase Authentication (optional)
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support
- ✅ Chart visualizations (Recharts)
- ✅ Excel/CSV export
- ✅ Receipt scanning (OCR)
- ✅ Voice input
- ✅ AI-powered insights

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared components
│   │   ├── features/    # Feature-specific components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components
│   ├── config/          # Configuration files
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main App component
│   ├── App.css          # App styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── package.json         # Dependencies
└── README.md            # This file
```

## 🛠️ Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Backend API running (see ../backend/README.md)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# VITE_API_URL=http://localhost:5000/api
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Firebase Configuration (Optional)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Authentication Method
VITE_AUTH_METHOD=backend
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The app will be available at `http://localhost:3000`

## 📱 Features Overview

### Dashboard
- Overview of expenses, income, and budgets
- Quick stats and charts
- Recent transactions
- Budget alerts

### Expenses
- Add, edit, delete expenses
- Category-based organization
- Receipt scanning (OCR)
- Voice input
- Advanced search and filters
- Recurring expenses
- Export to Excel/CSV

### Income
- Track income sources
- Monthly income summary
- Income vs expenses comparison

### Budgets
- Set category budgets
- Budget tracking
- Overspending alerts
- AI-powered recommendations

### Goals
- Set financial goals
- Track progress
- Deadline reminders

### Analytics
- Spending patterns
- Category breakdown
- Trends over time
- Spending heatmap
- Custom date ranges

### AI Assistant
- Chat with AI for financial insights
- Smart expense categorization
- Budget recommendations
- Spending analysis

### Achievements
- Gamification badges
- Milestone tracking
- Progress rewards

### Settings
- Profile management
- Preferences
- Data export
- PWA installation
- Biometric authentication

## 🎨 Design System

### Colors

```javascript
primary: '#4361ee'      // Main brand color
secondary: '#7209b7'    // Secondary brand color
accent: '#f72585'       // Accent color
success: '#10b981'      // Success states
danger: '#ef4444'       // Error states
warning: '#f59e0b'      // Warning states
```

### Typography

- Font Family: Inter
- Font Weights: 300, 400, 500, 600, 700, 800, 900
- Responsive font sizes with letter-spacing optimization

### Components

- Buttons: Primary, Secondary, Success, Danger
- Cards: Standard, Purple gradient, Glass effect
- Inputs: Standard, Auth, Purple focus
- Badges: Category-based colors
- Modals: Animated with backdrop
- Toasts: React Hot Toast

## 📦 Dependencies

### Core
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.1

### UI & Styling
- tailwindcss: ^3.3.6
- framer-motion: ^12.33.0
- lucide-react: ^0.294.0
- react-hot-toast: ^2.4.1

### Data & Charts
- recharts: ^3.7.0
- date-fns: ^2.30.0
- xlsx: ^0.18.5

### API & Auth
- axios: ^1.6.2
- firebase: ^12.8.0

### Build Tools
- vite: ^5.0.8
- @vitejs/plugin-react: ^4.2.1
- vite-plugin-pwa: ^1.2.0

## 🔧 Configuration

### Vite

- Port: 3000
- PWA support with offline caching
- Code splitting for optimal performance
- Fast refresh for development

### Tailwind

- Custom color palette
- Responsive breakpoints
- Custom animations
- Typography optimization

### PWA

- Offline support
- Install prompt
- Service worker caching
- Background sync

## 📱 PWA Features

### Installation

Users can install the app on their devices:
- iOS: Add to Home Screen
- Android: Install App prompt
- Desktop: Install button in browser

### Offline Support

- Cached assets for offline use
- Offline queue for write operations
- Automatic sync when online
- Offline indicator

### Caching Strategy

- API calls: NetworkFirst (5 min cache)
- Images: CacheFirst (30 days)
- Fonts: CacheFirst (1 year)
- Firebase Storage: CacheFirst (7 days)

## 🔐 Authentication

### Backend Auth (Default)

- Email/password registration
- JWT token-based
- Secure password requirements
- Session management

### Firebase Auth (Optional)

- Google Sign-In
- Email/password
- Social providers
- Biometric authentication

## 📊 State Management

### Context API

- AuthContext: User authentication state
- ExpenseContext: Expense data and operations
- IncomeContext: Income data and operations

### Local Storage

- User session
- Auth tokens
- Offline queue
- User preferences

## 🎯 Performance

### Optimizations

- Code splitting by route
- Lazy loading components
- Image optimization
- Bundle size optimization
- Tree shaking

### Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📱 Responsive Design

### Breakpoints

- xs: 475px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Mobile-First Approach

- Touch-friendly tap targets (44px minimum)
- Optimized for small screens
- Progressive enhancement
- Safe area support for notched devices

## 🚀 Deployment

### Build

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables

Set these in your deployment platform:
- `VITE_API_URL`: Your backend API URL
- Firebase config (if using Firebase auth)

## 🔗 API Integration

### Base URL

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

### Authentication

All API requests include JWT token:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Error Handling

- Network errors: Offline queue
- 401: Redirect to login
- 429: Rate limit message
- 500+: Server error message

## 📚 Documentation

- [Backend API](../backend/README.md)
- [Migration Guide](../COMPLETE_MIGRATION_GUIDE.md)
- [Project Status](../PROJECT_STATUS_FINAL.md)

## 🤝 Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Implement proper error handling
4. Add PropTypes or TypeScript types
5. Follow the existing code style
6. Test on mobile devices

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Related

- Backend: `../backend`
- Original Project: `../client` and `../server`
- Documentation: `../docs`

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
