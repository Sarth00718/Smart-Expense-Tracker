# Changelog

All notable changes to the Smart Expense Tracker project.

## [2.0.0] - 2026-02-07

### Added - Major Features
- 📤 **Centralized Common Export Component** - Global export functionality
  - Unified export interface accessible from application header
  - Positioned left of profile icon for consistent access across all pages
  - Support for multiple data types: All Data, Expenses Only, Income Only
  - Multiple export formats: CSV, Excel, JSON, and Comprehensive PDF
  - Optional date range filtering for all exports
  - **Comprehensive PDF Report** with visual analytics:
    - Executive summary with key financial metrics
    - Income vs Expense overview chart
    - Category breakdown pie chart
    - Spending trend line chart
    - Monthly comparison bar chart
    - Detailed category breakdown
    - Budget status and utilization tracking
    - Savings goals progress monitoring
    - Recent transactions list
    - Professional formatting with page numbers
  - Server-side chart generation using Chart.js
  - High-quality embedded chart images in PDF
  - Clean architecture with reusable components
  - Removed redundant export buttons from individual pages
  - Enhanced user experience with modal-based interface

### Changed
- Refactored export system for better maintainability
- Moved export functionality from Settings page to global header
- Removed DataExport component from Settings
- Removed export buttons from Expenses and Analytics pages
- Improved export service with additional methods
- Enhanced PDF generation with visual charts

### Technical Improvements
- Added `chartjs-node-canvas` for server-side chart rendering
- Created `chartGenerator.js` utility for chart generation
- Enhanced export routes with comprehensive PDF endpoint
- Implemented proper data aggregation from backend APIs
- Optimized performance for large dataset exports
- Added proper error handling and loading states

## [1.1.0] - 2026-02-07

### Added - New Features
- 🔐 **Biometric Authentication** - Fingerprint and Face ID login support
  - WebAuthn API integration for secure biometric authentication
  - Platform authenticator support (Touch ID, Face ID, Windows Hello)
  - Credential management in user settings
  - Fallback to traditional login methods
- 🤖 **Enhanced AI Assistant** - ChatGPT-style conversational finance bot
  - "Where did I overspend this month?" - Detailed overspending analysis
  - "Suggest budget plan for ₹20,000 salary" - Personalized budget recommendations
  - Natural language understanding for complex financial queries
  - Improved quick question buttons
  - Better context-aware responses
  - 🎤 **Voice Input** - Speak your questions to the AI assistant
    - Web Speech API integration
    - Real-time voice recognition
    - Visual feedback while listening
    - Automatic text conversion
- 📊 **Data Export System** - Export financial data in multiple formats
  - Export expenses to CSV, Excel, and JSON
  - Export income records to CSV
  - Complete financial data export with all categories
  - Multi-sheet Excel exports with summary
  - Date range filtering for exports
  - Dedicated export settings page

### Added - Backend APIs
- `/api/biometric/register` - Register biometric credentials
- `/api/biometric/authenticate` - Authenticate using biometrics
- `/api/biometric/credentials` - Manage biometric credentials
- `/api/export/expenses` - Export expenses data
- `/api/export/income` - Export income data
- `/api/export/all` - Export complete financial data

### Added - UI Components
- `BiometricSettings.jsx` - Biometric authentication management
- `DataExport.jsx` - Data export interface
- Enhanced Settings page with new tabs
- Biometric login button on login page
- Improved AI chat interface with more quick questions

### Technical Improvements
- Added `xlsx` library for Excel export functionality
- WebAuthn API integration for biometric authentication
- Enhanced AI route with specialized query handlers
- Improved error handling and user feedback
- Better mobile responsiveness for new features

## [1.0.0] - 2024

### Added - Core Features
- ✅ User authentication with JWT and bcrypt
- ✅ Dual authentication support (Backend + Firebase)
- ✅ Expense tracking with categories
- ✅ Income management
- ✅ Budget planning and monitoring
- ✅ Savings goals with progress tracking
- ✅ Analytics dashboard with charts
- ✅ Natural language expense search
- ✅ Advanced filtering system
- ✅ PWA support with offline capabilities
- ✅ Receipt scanning with OCR (Tesseract.js)
- ✅ Voice input for expenses
- ✅ AI-powered financial assistant (Groq API)
- ✅ Budget recommendations
- ✅ Achievement system with badges
- ✅ PDF report generation
- ✅ Spending heatmap calendar view
- ✅ Export data to CSV/Excel

### Added - Security
- ✅ Rate limiting on all API endpoints
- ✅ Input sanitization and validation
- ✅ CORS configuration with whitelist
- ✅ Security headers (XSS, clickjacking protection)
- ✅ MongoDB injection prevention
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token expiration (7 days)
- ✅ Environment variable validation
- ✅ Request size limits (1MB)
- ✅ Timeout protection (30 seconds)

### Added - Performance
- ✅ Database indexing on frequently queried fields
- ✅ Pagination for large datasets
- ✅ MongoDB aggregation pipelines
- ✅ Code splitting and lazy loading
- ✅ Service worker caching
- ✅ Image optimization
- ✅ Gzip compression ready
- ✅ CDN-ready static assets

### Added - Developer Experience
- ✅ Comprehensive API documentation
- ✅ Environment variable examples
- ✅ Deployment guides (Render + Vercel)
- ✅ README with setup instructions
- ✅ Error handling and logging
- ✅ Graceful shutdown handling
- ✅ Health check endpoints
- ✅ Development and production modes

### Fixed - Bugs
- ✅ Fixed route ordering issues (specific routes before parameterized)
- ✅ Fixed CORS configuration for production
- ✅ Fixed MongoDB connection error handling
- ✅ Fixed expense context loading when user is null
- ✅ Fixed API timeout issues (increased to 30s)
- ✅ Fixed environment variable fallbacks
- ✅ Fixed error message exposure in production
- ✅ Fixed rate limit error messages
- ✅ Fixed voice parser currency pattern
- ✅ Fixed budget recommendations calculation

### Improved - Code Quality
- ✅ Removed duplicate code
- ✅ Optimized database queries
- ✅ Improved error handling
- ✅ Added input validation
- ✅ Refactored authentication flow
- ✅ Cleaned up unused imports
- ✅ Standardized API responses
- ✅ Improved code comments
- ✅ Added JSDoc documentation
- ✅ Consistent naming conventions

### Improved - User Experience
- ✅ Better error messages
- ✅ Loading states
- ✅ Offline indicators
- ✅ PWA install prompts
- ✅ Update notifications
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Mobile-friendly UI
- ✅ Accessibility improvements

### Configuration
- ✅ Updated .gitignore for better coverage
- ✅ Added security middleware
- ✅ Configured MongoDB connection options
- ✅ Set up graceful shutdown
- ✅ Added server error handling
- ✅ Configured CORS for multiple origins
- ✅ Set up rate limiting tiers
- ✅ Added request sanitization

### Documentation
- ✅ Created comprehensive README
- ✅ Added deployment guide
- ✅ Documented all API endpoints
- ✅ Added environment variable documentation
- ✅ Created troubleshooting guide
- ✅ Added security checklist
- ✅ Documented scaling considerations
- ✅ Added cost estimation guide

### Dependencies
- ✅ Updated to latest stable versions
- ✅ Added engine requirements (Node 16+)
- ✅ Removed unused dependencies
- ✅ Added security-focused packages
- ✅ Optimized bundle size

## Future Enhancements

### Planned Features
- [ ] Multi-currency support
- [ ] Recurring expenses automation
- [ ] Bank account integration
- [ ] Email notifications
- [ ] Data export scheduling
- [ ] Advanced analytics (ML predictions)
- [ ] Social features (shared budgets)
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multi-language support

### Technical Improvements
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add code coverage reporting
- [ ] Implement Redis caching
- [ ] Add WebSocket for real-time updates
- [ ] Implement data archiving
- [ ] Add database migrations
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Add performance profiling

### Security Enhancements
- [ ] Two-factor authentication
- [ ] Biometric authentication
- [ ] Session management improvements
- [ ] Audit logging
- [ ] GDPR compliance features
- [ ] Data encryption at rest
- [ ] Security scanning automation
- [ ] Penetration testing

## Breaking Changes

None in version 1.0.0

## Migration Guide

Not applicable for version 1.0.0

## Contributors

- Initial development and architecture
- Bug fixes and optimizations
- Documentation and deployment guides

## License

MIT License - See LICENSE file for details

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.
