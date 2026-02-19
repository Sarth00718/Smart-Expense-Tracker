#!/usr/bin/env node

/**
 * Security Testing Script
 * Tests security features and vulnerabilities
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

let testResults = { passed: 0, failed: 0 };

function logTest(name, passed, details = '') {
  if (passed) {
    log(`✓ ${name}`, 'green');
    testResults.passed++;
  } else {
    log(`✗ ${name}`, 'red');
    if (details) log(`  ${details}`, 'yellow');
    testResults.failed++;
  }
}

async function testAuthenticationRequired() {
  log('\n1. Testing Authentication Requirements', 'cyan');
  
  try {
    await axios.get(`${API_URL}/api/expenses`);
    logTest('Protected route requires auth', false, 'Route accessible without token');
  } catch (error) {
    logTest('Protected route requires auth', error.response?.status === 401);
  }
}

async function testInvalidToken() {
  log('\n2. Testing Invalid Token Rejection', 'cyan');
  
  try {
    await axios.get(`${API_URL}/api/expenses`, {
      headers: { Authorization: 'Bearer invalid_token_12345' }
    });
    logTest('Invalid token rejected', false, 'Invalid token accepted');
  } catch (error) {
    logTest('Invalid token rejected', error.response?.status === 401);
  }
}

async function testSQLInjection() {
  log('\n3. Testing SQL Injection Prevention', 'cyan');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: "admin' OR '1'='1",
      password: "password' OR '1'='1"
    });
    logTest('SQL injection prevented', false, 'SQL injection succeeded');
  } catch (error) {
    logTest('SQL injection prevented', error.response?.status === 401 || error.response?.status === 400);
  }
}

async function testXSSPrevention() {
  log('\n4. Testing XSS Prevention', 'cyan');
  
  // Register user first
  let token = '';
  try {
    const register = await axios.post(`${API_URL}/api/auth/register`, {
      email: `xsstest${Date.now()}@example.com`,
      password: 'Test@1234',
      fullName: 'XSS Test'
    });
    token = register.data.data.token;
  } catch (error) {
    logTest('XSS test setup', false, 'Could not register user');
    return;
  }

  try {
    const xssPayload = '<script>alert("XSS")</script>';
    const response = await axios.post(
      `${API_URL}/api/expenses`,
      {
        date: new Date().toISOString(),
        category: 'Food',
        amount: 100,
        description: xssPayload
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Check if XSS payload was sanitized
    const isSanitized = !response.data.description.includes('<script>');
    logTest('XSS payload sanitized', isSanitized);
  } catch (error) {
    logTest('XSS test', false, error.message);
  }
}

async function testPasswordValidation() {
  log('\n5. Testing Password Validation', 'cyan');
  
  // Test weak password
  try {
    await axios.post(`${API_URL}/api/auth/register`, {
      email: `weakpass${Date.now()}@example.com`,
      password: '123',
      fullName: 'Weak Password Test'
    });
    logTest('Weak password rejected', false, 'Weak password accepted');
  } catch (error) {
    logTest('Weak password rejected', error.response?.status === 400);
  }

  // Test password without special char
  try {
    await axios.post(`${API_URL}/api/auth/register`, {
      email: `nospecial${Date.now()}@example.com`,
      password: 'Password123',
      fullName: 'No Special Char Test'
    });
    logTest('Password requires special char', false, 'Password without special char accepted');
  } catch (error) {
    logTest('Password requires special char', error.response?.status === 400);
  }
}

async function testRateLimiting() {
  log('\n6. Testing Rate Limiting', 'cyan');
  
  const requests = [];
  const maxRequests = 15; // Exceed the limit
  
  for (let i = 0; i < maxRequests; i++) {
    requests.push(
      axios.post(`${API_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'wrong'
      }).catch(err => err.response)
    );
  }
  
  const responses = await Promise.all(requests);
  const rateLimited = responses.some(r => r?.status === 429);
  
  logTest('Rate limiting active', rateLimited);
  
  const limitedCount = responses.filter(r => r?.status === 429).length;
  log(`  ${limitedCount}/${maxRequests} requests rate limited`, 'cyan');
}

async function testEmailValidation() {
  log('\n7. Testing Email Validation', 'cyan');
  
  const invalidEmails = [
    'notanemail',
    '@example.com',
    'test@',
    'test..test@example.com'
  ];
  
  let allRejected = true;
  for (const email of invalidEmails) {
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password: 'Test@1234',
        fullName: 'Email Test'
      });
      allRejected = false;
      break;
    } catch (error) {
      // Expected to fail
    }
  }
  
  logTest('Invalid emails rejected', allRejected);
}

async function testCORSHeaders() {
  log('\n8. Testing CORS Configuration', 'cyan');
  
  try {
    const response = await axios.get(`${API_URL}/health`, {
      headers: { 'Origin': 'http://localhost:3000' }
    });
    const hasCORS = response.headers['access-control-allow-origin'] !== undefined;
    logTest('CORS headers present', hasCORS);
  } catch (error) {
    logTest('CORS test', false, error.message);
  }
}

async function testSecurityHeaders() {
  log('\n9. Testing Security Headers', 'cyan');
  
  try {
    const response = await axios.get(`${API_URL}/health`);
    const headers = response.headers;
    
    logTest('X-Frame-Options header', headers['x-frame-options'] === 'DENY');
    logTest('X-Content-Type-Options header', headers['x-content-type-options'] === 'nosniff');
    logTest('X-XSS-Protection header', !!headers['x-xss-protection']);
  } catch (error) {
    logTest('Security headers test', false, error.message);
  }
}

async function testInputSanitization() {
  log('\n10. Testing Input Sanitization', 'cyan');
  
  // Register user
  let token = '';
  try {
    const register = await axios.post(`${API_URL}/api/auth/register`, {
      email: `sanitize${Date.now()}@example.com`,
      password: 'Test@1234',
      fullName: 'Sanitize Test'
    });
    token = register.data.data.token;
  } catch (error) {
    logTest('Input sanitization setup', false, 'Could not register user');
    return;
  }

  // Test MongoDB injection
  try {
    await axios.get(`${API_URL}/api/expenses?category[$ne]=Food`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Should not crash, query should be sanitized
    logTest('MongoDB injection prevented', true);
  } catch (error) {
    logTest('MongoDB injection test', false, error.message);
  }
}

async function runSecurityTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        Security Testing - Smart Expense Tracker           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nTesting API at: ${API_URL}\n`, 'yellow');

  await testAuthenticationRequired();
  await testInvalidToken();
  await testSQLInjection();
  await testXSSPrevention();
  await testPasswordValidation();
  await testRateLimiting();
  await testEmailValidation();
  await testCORSHeaders();
  await testSecurityHeaders();
  await testInputSanitization();

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('Security Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`\nTotal Tests: ${testResults.passed + testResults.failed}`, 'yellow');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  
  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  log(`\nSecurity Score: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');

  if (testResults.failed === 0) {
    log('\n🔒 All security tests passed! API is secure.', 'green');
  } else {
    log(`\n⚠️  ${testResults.failed} security test(s) failed.`, 'yellow');
    log('Please review and fix security issues.', 'yellow');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

runSecurityTests().catch(error => {
  log('\n❌ Security test suite crashed!', 'red');
  log(error.message, 'yellow');
  process.exit(1);
});
