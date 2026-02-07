# Contributing to Smart Expense Tracker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Any relevant examples or mockups

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**:
   ```bash
   git commit -m "Add: feature description"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

### Setup Steps

1. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
   ```

2. **Install backend dependencies**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Start backend**:
   ```bash
   cd server
   npm run dev
   ```

6. **Start frontend** (in new terminal):
   ```bash
   cd client
   npm run dev
   ```

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Follow functional programming principles
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over promises

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: Max 100 characters
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for components and classes
  - UPPER_CASE for constants

### Example

```javascript
// Good
const calculateTotal = (expenses) => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Bad
function calc(e) {
  var t = 0;
  for (var i = 0; i < e.length; i++) {
    t = t + e[i].amount;
  }
  return t;
}
```

## Project Structure

```
expense-tracker/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   └── public/            # Static assets
├── server/                # Backend Node.js app
│   ├── routes/           # API routes
│   ├── models/           # Mongoose models
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
└── docs/                 # Documentation
```

## Commit Message Guidelines

Use conventional commits format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat: add voice input for expenses
fix: resolve CORS issue in production
docs: update deployment guide
refactor: optimize database queries
```

## Testing Guidelines

### Before Submitting PR

1. **Manual Testing**:
   - Test all affected features
   - Test on different browsers
   - Test responsive design
   - Test error scenarios

2. **Code Review**:
   - Review your own code first
   - Check for console errors
   - Verify no sensitive data is exposed
   - Ensure environment variables are used

3. **Performance**:
   - Check for memory leaks
   - Optimize database queries
   - Minimize API calls
   - Optimize bundle size

## API Development

### Adding New Endpoints

1. **Create route file** in `server/routes/`
2. **Add validation** using express-validator
3. **Implement authentication** if needed
4. **Add rate limiting**
5. **Document the endpoint** in README
6. **Test thoroughly**

### Example Route

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET /api/example
// @desc    Example endpoint
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Implementation
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

## Database Changes

### Adding New Models

1. Create model file in `server/models/`
2. Define schema with validation
3. Add indexes for performance
4. Document the model
5. Update related routes

### Example Model

```javascript
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Add indexes
exampleSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Example', exampleSchema);
```

## Frontend Development

### Adding New Components

1. Create component in appropriate directory
2. Use functional components with hooks
3. Add PropTypes or TypeScript types
4. Make it responsive
5. Add error handling
6. Document props

### Example Component

```javascript
import React, { useState } from 'react';

const ExampleComponent = ({ title, onSubmit }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ExampleComponent;
```

## Security Guidelines

- Never commit sensitive data (.env files)
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries
- Implement rate limiting
- Use HTTPS in production
- Keep dependencies updated
- Follow OWASP guidelines

## Documentation

- Update README for new features
- Add JSDoc comments for functions
- Document API endpoints
- Update deployment guide if needed
- Add examples for complex features

## Review Process

1. **Automated Checks**:
   - Code builds successfully
   - No linting errors
   - All tests pass

2. **Manual Review**:
   - Code quality and style
   - Security considerations
   - Performance impact
   - Documentation completeness

3. **Feedback**:
   - Address review comments
   - Make requested changes
   - Re-request review

## Getting Help

- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Smart Expense Tracker! 🎉
