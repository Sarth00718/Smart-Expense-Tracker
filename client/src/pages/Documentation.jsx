import { useState } from 'react'
import { 
  BookOpen, 
  Rocket, 
  Code, 
  Database, 
  Shield, 
  Zap,
  Users,
  FileText,
  Settings,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Search
} from 'lucide-react'
import Card from '../components/ui/Card'

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', icon: BookOpen, label: 'Overview', color: 'blue' },
    { id: 'features', icon: Zap, label: 'Features', color: 'purple' },
    { id: 'getting-started', icon: Rocket, label: 'Getting Started', color: 'green' },
    { id: 'api', icon: Code, label: 'API Reference', color: 'orange' },
    { id: 'components', icon: FileText, label: 'Components', color: 'pink' },
    { id: 'deployment', icon: Settings, label: 'Deployment', color: 'indigo' },
    { id: 'troubleshooting', icon: HelpCircle, label: 'Troubleshooting', color: 'red' },
  ]

  const features = [
    {
      title: 'Expense Tracking',
      description: 'Add, edit, delete, and categorize expenses with ease',
      icon: '📊',
      items: ['CRUD operations', 'Categories & tags', 'Recurring expenses', 'Receipt attachments']
    },
    {
      title: 'Income Management',
      description: 'Track multiple income sources and recurring income',
      icon: '💰',
      items: ['Multiple sources', 'Recurring income', 'Income categories', 'Historical records']
    },
    {
      title: 'Budget Planning',
      description: 'Set and monitor category-based budgets',
      icon: '🎯',
      items: ['Category budgets', 'Progress tracking', 'Budget alerts', 'AI recommendations']
    },
    {
      title: 'AI Assistant',
      description: 'ChatGPT-style conversational finance assistant',
      icon: '🤖',
      items: ['Natural language queries', 'Voice input', 'Budget suggestions', 'Spending analysis']
    },
    {
      title: 'Receipt Scanner',
      description: 'OCR-powered receipt scanning with Tesseract.js',
      icon: '📸',
      items: ['Image upload', 'Text extraction', 'Auto-fill data', 'Preview & edit']
    },
    {
      title: 'Analytics Dashboard',
      description: 'Visualize spending patterns with interactive charts',
      icon: '📈',
      items: ['Interactive charts', 'Spending heatmap', 'Trend analysis', 'Export charts']
    },
    {
      title: 'PWA Support',
      description: 'Install as mobile/desktop app, works offline',
      icon: '📱',
      items: ['Offline mode', 'Install on device', 'Push notifications', 'Background sync']
    },
    {
      title: 'Data Export',
      description: 'Export to Excel, CSV, JSON, or PDF formats',
      icon: '📄',
      items: ['Multiple formats', 'Date range filters', 'Selective export', 'PDF reports']
    },
  ]

  const quickLinks = [
    { title: 'Installation Guide', href: '#getting-started', icon: Rocket },
    { title: 'API Documentation', href: '#api', icon: Code },
    { title: 'Component Library', href: '#components', icon: FileText },
    { title: 'Deployment Guide', href: '#deployment', icon: Settings },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
            <p className="text-gray-600">Complete guide to Smart Expense Tracker</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link) => (
          <a
            key={link.title}
            href={link.href}
            className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <link.icon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-gray-900">{link.title}</span>
            <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </a>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map((section) => {
          const isActive = activeSection === section.id
          const colorClasses = {
            blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-500' : '',
            purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-500' : '',
            green: isActive ? 'bg-green-100 text-green-700 border-green-500' : '',
            orange: isActive ? 'bg-orange-100 text-orange-700 border-orange-500' : '',
            pink: isActive ? 'bg-pink-100 text-pink-700 border-pink-500' : '',
            indigo: isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-500' : '',
            red: isActive ? 'bg-red-100 text-red-700 border-red-500' : '',
          }
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? `${colorClasses[section.color]} border-2`
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
            <p className="text-gray-700 mb-4">
              Smart Expense Tracker is a full-stack MERN (MongoDB, Express, React, Node.js) application 
              designed to help users manage their finances effectively. It combines traditional expense 
              tracking with modern features like AI assistance, voice input, receipt scanning, and PWA capabilities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Tech Stack</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• React 18 + Vite</li>
                  <li>• Node.js + Express</li>
                  <li>• MongoDB + Mongoose</li>
                  <li>• Tailwind CSS</li>
                  <li>• Chart.js & Recharts</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Key Features</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• AI-Powered Insights</li>
                  <li>• Receipt Scanner (OCR)</li>
                  <li>• Voice Input</li>
                  <li>• PWA Support</li>
                  <li>• Real-time Analytics</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture</h2>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`
Frontend (React)          Backend (Node.js)         Database (MongoDB)
├── components/           ├── routes/               ├── users
│   ├── features/        │   ├── auth.js          ├── expenses
│   ├── layout/          │   ├── expenses.js      ├── income
│   └── ui/              │   ├── budgets.js       ├── budgets
├── services/            │   └── goals.js         ├── goals
├── context/             ├── models/               └── achievements
└── pages/               ├── middleware/
                         └── utils/
              `}</pre>
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-3">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}


      {activeSection === 'getting-started' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Installation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Node.js 16+ and npm 8+</li>
                  <li>MongoDB (local or Atlas)</li>
                  <li>Groq API Key (optional, for AI features)</li>
                  <li>Firebase Project (optional, for Firebase Auth)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Backend Setup</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm start`}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Frontend Setup</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`cd client
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev`}</pre>
                </div>
              </div>

              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>✓ Success!</strong> Frontend runs on http://localhost:3000 and Backend on http://localhost:5000
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start Guide</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Register Account</h3>
                  <p className="text-gray-600 text-sm">Create your account with email and password or use Google Sign-In</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add First Expense</h3>
                  <p className="text-gray-600 text-sm">Navigate to Expenses and click "Add Expense" to record your first transaction</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Set Up Budget</h3>
                  <p className="text-gray-600 text-sm">Go to Budgets page and set spending limits for different categories</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create Savings Goal</h3>
                  <p className="text-gray-600 text-sm">Set financial goals and track your progress towards achieving them</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Explore Features</h3>
                  <p className="text-gray-600 text-sm">Try AI Assistant, Receipt Scanner, Voice Input, and Analytics</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'api' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">API Endpoints</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Authentication
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                      <code className="text-sm">/api/auth/register</code>
                    </div>
                    <p className="text-sm text-gray-600">Register new user</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                      <code className="text-sm">/api/auth/login</code>
                    </div>
                    <p className="text-sm text-gray-600">Login user</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                      <code className="text-sm">/api/auth/me</code>
                    </div>
                    <p className="text-sm text-gray-600">Get current user</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  Expenses
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                      <code className="text-sm">/api/expenses</code>
                    </div>
                    <p className="text-sm text-gray-600">Get all expenses (paginated)</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                      <code className="text-sm">/api/expenses</code>
                    </div>
                    <p className="text-sm text-gray-600">Add new expense</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">PUT</span>
                      <code className="text-sm">/api/expenses/:id</code>
                    </div>
                    <p className="text-sm text-gray-600">Update expense</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">DELETE</span>
                      <code className="text-sm">/api/expenses/:id</code>
                    </div>
                    <p className="text-sm text-gray-600">Delete expense</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>📘 Full API Documentation:</strong> For complete API reference with request/response examples, 
                  see <code className="bg-blue-100 px-2 py-1 rounded">docs/PROJECT_DOCUMENTATION.md</code>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'components' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Component Library</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Layout Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-semibold text-blue-600">Header</code>
                    <p className="text-xs text-gray-600 mt-1">Top navigation with notifications and user menu</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-semibold text-blue-600">Sidebar</code>
                    <p className="text-xs text-gray-600 mt-1">Desktop navigation menu</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-semibold text-blue-600">MobileNav</code>
                    <p className="text-xs text-gray-600 mt-1">Bottom navigation for mobile</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-semibold text-blue-600">AppLayout</code>
                    <p className="text-xs text-gray-600 mt-1">Main layout wrapper</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">UI Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-semibold text-purple-600">Card</code>
                    <p className="text-xs text-gray-600 mt-1">Styled container with shadow</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-semibold text-purple-600">Button</code>
                    <p className="text-xs text-gray-600 mt-1">Button with variants</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-semibold text-purple-600">Modal</code>
                    <p className="text-xs text-gray-600 mt-1">Dialog with backdrop</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-semibold text-purple-600">AnimatedCard</code>
                    <p className="text-xs text-gray-600 mt-1">Card with entrance animations</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <p className="text-purple-800 text-sm">
                  <strong>📦 Component Details:</strong> All components are located in <code className="bg-purple-100 px-2 py-1 rounded">client/src/components/</code>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'deployment' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deployment Guide</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Backend (Render)
                </h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700">
                  <li>Push code to GitHub</li>
                  <li>Create new Web Service on Render</li>
                  <li>Connect GitHub repository</li>
                  <li>Set build command: <code className="bg-gray-100 px-2 py-1 rounded text-sm">cd server && npm install</code></li>
                  <li>Set start command: <code className="bg-gray-100 px-2 py-1 rounded text-sm">cd server && npm start</code></li>
                  <li>Add environment variables</li>
                  <li>Deploy!</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Frontend (Vercel)
                </h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700">
                  <li>Push code to GitHub</li>
                  <li>Import project to Vercel</li>
                  <li>Set framework: Vite</li>
                  <li>Set root directory: <code className="bg-gray-100 px-2 py-1 rounded text-sm">client</code></li>
                  <li>Set build command: <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run build</code></li>
                  <li>Add environment variables</li>
                  <li>Deploy!</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>✓ Pro Tip:</strong> Use MongoDB Atlas for database hosting. It's free and integrates seamlessly!
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'troubleshooting' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Issues</h2>
            <div className="space-y-4">
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Backend won't start</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Check MongoDB connection</li>
                  <li>Verify environment variables</li>
                  <li>Ensure port 5000 is not in use</li>
                  <li>Check console for error messages</li>
                </ul>
              </div>

              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Frontend won't connect</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Verify VITE_API_URL is correct</li>
                  <li>Check CORS settings in backend</li>
                  <li>Open browser dev tools → Network tab</li>
                  <li>Ensure backend is running</li>
                </ul>
              </div>

              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Authentication not working</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Check JWT secret (32+ characters)</li>
                  <li>Look for token in localStorage</li>
                  <li>Verify auth method matches</li>
                  <li>Try clearing localStorage</li>
                </ul>
              </div>

              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">PWA not installing</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Ensure HTTPS (except localhost)</li>
                  <li>Check manifest.json is accessible</li>
                  <li>Look for service worker errors</li>
                  <li>Try different browser</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need More Help?</h2>
            <div className="space-y-3">
              <a 
                href="https://github.com/yourusername/smart-expense-tracker/issues" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">GitHub Issues</p>
                  <p className="text-sm text-gray-600">Report bugs and request features</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-900">Full Documentation</p>
                  <p className="text-sm text-gray-600">See docs/PROJECT_DOCUMENTATION.md</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Complete Documentation</h3>
        </div>
        <p className="text-gray-700 mb-4">
          For comprehensive documentation including detailed API reference, component specifications, 
          and advanced usage guides, see the full documentation file.
        </p>
        <a
          href="/docs/PROJECT_DOCUMENTATION.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FileText className="w-4 h-4" />
          View Full Documentation
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

export default Documentation
