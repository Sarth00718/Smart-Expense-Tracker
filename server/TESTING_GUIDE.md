# Testing Guide - Smart Expense Tracker Backend

## 📋 Overview

This guide covers all testing scripts and procedures for the Smart Expense Tracker backend API.

---

## 🧪 Available Test Suites

### 1. Quick Test (`test-quick.js`)
**Purpose**: Fast smoke test for essential functionality  
**Duration**: ~5 seconds  
**Tests**: 4 critical endpoints

```bash
npm run test:quick
```

**What it tests:**
- ✓ Health check
- ✓ User registration
- ✓ Create expense
- ✓ Get expenses

**Use when:**
- Quick verification after code changes
- CI/CD pipeline checks
- Before committing code

---

### 2. Comprehensive API Test (`test-api.js`)
**Purpose**: Full API functionality test  
**Duration**: ~30 seconds  
**Tests**: 17 test scenarios

```bash
npm test
# or
npm run test
```

**What it tests:**
1. Health check
2. User registration
3. User login
4. Get user profile
5. Create expense
6. Get expenses (paginated)
7. Update expense
8. Create income
9. Set budget
10. Get budgets
11. Create goal
12. Analytics dashboard
13. Achievements
14. Voice input parsing
15. Data export
16. Rate limiting
17. Delete expense

**Use when:**
- Before deploying to production
- After major changes
- Weekly regression testing

---

### 3. Security Test (`test-security.js`)
**Purpose**: Security vulnerability testing  
**Duration**: ~20 seconds  
**Tests**: 10 security scenarios

```bash
npm run test:security
```

**What it tests:**
1. Authentication required for protected routes
2. Invalid token rejection
3. SQL injection prevention
4. XSS prevention
5. Password validation (strength requirements)
6. Rate limiting
7. Email validation
8. CORS configuration
9. Security headers
10. Input sanitization (MongoDB injection)

**Use when:**
- Before production deployment
- After security-related changes
- Monthly security audits

---

### 4. Load Test (`test-load.js`)
**Purpose**: Performance under concurrent load  
**Duration**: ~15 seconds (default config)  
**Tests**: Concurrent user simulation

```bash
npm run test:load
```

**Default Configuration:**
- Concurrent Users: 10
- Requests per User: 5
- Total Requests: 50

**Custom Configuration:**
```bash
CONCURRENT_USERS=20 REQUESTS_PER_USER=10 npm run test:load
```

**Metrics Provided:**
- Total requests
- Success rate
- Requests per second
- Average response time
- Min/Max response time
- Performance rating (⭐⭐⭐⭐⭐)

**Use when:**
- Performance optimization
- Before scaling infrastructure
- Capacity planning

---

### 5. All Tests (`test:all`)
**Purpose**: Run all tests sequentially  
**Duration**: ~1 minute

```bash
npm run test:all
```

**Runs:**
1. Quick test
2. Comprehensive API test
3. Security test

**Use when:**
- Pre-deployment validation
- Major release testing
- Complete system verification

---

## 🚀 Getting Started

### Prerequisites

1. **Server must be running:**
```bash
# Terminal 1: Start server
npm run dev
```

2. **MongoDB must be accessible:**
- Local: `mongodb://localhost:27017/expense-tracker`
- Atlas: Configure in `.env`

3. **Environment variables configured:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running Your First Test

```bash
# Terminal 2: Run quick test
npm run test:quick
```

Expected output:
```
🚀 Quick API Test

Testing: http://localhost:5000

✓ Health check passed
  MongoDB: connected
  Uptime: 12.34s
✓ User registration passed
✓ Create expense passed
✓ Get expenses passed
  Total: 1

========================================
Results: 4 passed, 0 failed
========================================

🎉 All quick tests passed!
Backend is working correctly!
```

---

## 📊 Understanding Test Results

### Success Indicators

✅ **All tests passed:**
```
✓ Test name
  Additional info
```

❌ **Test failed:**
```
✗ Test name
  Error details
```

### Test Summary

```
Test Summary
============
Total Tests: 17
Passed: 17
Failed: 0
Duration: 28.45s

Success Rate: 100.0%

🎉 All tests passed! Backend is working perfectly!
```

### Performance Ratings

**Load Test Performance:**
- ⭐⭐⭐⭐⭐ Excellent (< 200ms avg)
- ⭐⭐⭐⭐ Good (< 500ms avg)
- ⭐⭐⭐ Fair (< 1s avg)
- ⭐⭐ Needs Improvement (> 1s avg)

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Server is not running"
```
❌ Server is not running or not accessible!
Please start the server with: npm run dev
```

**Solution:**
```bash
# Start the server first
npm run dev
```

#### 2. "MongoDB not connected"
```
✗ Health check failed
  MongoDB: disconnected
```

**Solution:**
- Check MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`
- Check network connectivity

#### 3. "Rate limiting triggered"
```
⚠️ Some requests rate limited
```

**Solution:**
- This is expected behavior
- Wait 1 minute and retry
- Or disable rate limiting in development:
  ```env
  DISABLE_RATE_LIMIT=true
  ```

#### 4. "Tests timing out"
```
Error: timeout of 30000ms exceeded
```

**Solution:**
- Check server performance
- Increase timeout in test script
- Check database query performance

---

## 🎯 Test Coverage

### API Endpoints Tested

#### Authentication (100%)
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ GET /api/auth/me

#### Expenses (100%)
- ✅ POST /api/expenses
- ✅ GET /api/expenses
- ✅ PUT /api/expenses/:id
- ✅ DELETE /api/expenses/:id

#### Income (100%)
- ✅ POST /api/income
- ✅ GET /api/income

#### Budgets (100%)
- ✅ POST /api/budgets
- ✅ GET /api/budgets

#### Goals (100%)
- ✅ POST /api/goals

#### Analytics (100%)
- ✅ GET /api/analytics/dashboard

#### Achievements (100%)
- ✅ GET /api/achievements

#### Voice (100%)
- ✅ POST /api/voice/parse

#### Export (100%)
- ✅ GET /api/export/all

### Security Features Tested

- ✅ JWT Authentication
- ✅ Password validation
- ✅ Email validation
- ✅ Rate limiting
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ MongoDB injection prevention
- ✅ CORS configuration
- ✅ Security headers
- ✅ Input sanitization

---

## 📈 CI/CD Integration

### GitHub Actions Example

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Start server
        run: |
          cd backend
          npm run dev &
          sleep 5
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          JWT_SECRET: test_secret_key_for_ci_cd_pipeline_testing_only
      
      - name: Run tests
        run: |
          cd backend
          npm run test:all
```

---

## 🔍 Advanced Testing

### Custom Test Configuration

#### Change API URL
```bash
API_URL=https://api.example.com npm test
```

#### Adjust Load Test Parameters
```bash
CONCURRENT_USERS=50 REQUESTS_PER_USER=20 npm run test:load
```

### Manual Testing with cURL

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "fullName": "Test User"
  }'
```

#### Create Expense (with token)
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "date": "2024-01-15",
    "category": "Food",
    "amount": 250,
    "description": "Lunch"
  }'
```

---

## 📝 Best Practices

### Before Committing Code
```bash
npm run test:quick
```

### Before Pull Request
```bash
npm run test:all
```

### Before Production Deployment
```bash
npm run test:all
npm run test:load
```

### Weekly Maintenance
```bash
npm run test:security
```

---

## 🎓 Writing Custom Tests

### Example: Testing New Endpoint

```javascript
async function testNewFeature() {
  try {
    const response = await axios.post(
      `${API_URL}/api/new-feature`,
      { data: 'test' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logTest('New feature works', response.status === 200);
    logTest('Response has data', !!response.data);
  } catch (error) {
    logTest('New feature', false, error.message);
  }
}
```

---

## 📞 Support

### Test Failures

If tests fail:
1. Check server logs
2. Verify environment variables
3. Check MongoDB connection
4. Review error messages
5. Check API documentation

### Performance Issues

If load tests show poor performance:
1. Check database indexes
2. Review query optimization
3. Check server resources
4. Consider caching
5. Profile slow endpoints

---

## 🎉 Success Criteria

### Production Ready Checklist

- [ ] Quick test passes (100%)
- [ ] Comprehensive test passes (100%)
- [ ] Security test passes (100%)
- [ ] Load test shows < 500ms avg response
- [ ] Success rate > 95%
- [ ] No critical security issues
- [ ] All endpoints functional

---

## 📚 Additional Resources

- [API Documentation](./README.md)
- [Backend Complete Guide](../BACKEND_COMPLETE.md)
- [Migration Guide](../COMPLETE_MIGRATION_GUIDE.md)

---

**Happy Testing! 🚀**
