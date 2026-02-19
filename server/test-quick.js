#!/usr/bin/env node

/**
 * Quick API Test - Basic Smoke Test
 * Tests essential endpoints quickly
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

async function quickTest() {
  log('\n🚀 Quick API Test\n', 'cyan');
  log(`Testing: ${API_URL}\n`, 'yellow');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    const health = await axios.get(`${API_URL}/health`);
    if (health.status === 200 && health.data.mongodb === 'connected') {
      log('✓ Health check passed', 'green');
      log(`  MongoDB: ${health.data.mongodb}`, 'cyan');
      log(`  Uptime: ${health.data.uptime.toFixed(2)}s`, 'cyan');
      passed++;
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    log('✗ Health check failed', 'red');
    log(`  ${error.message}`, 'yellow');
    failed++;
  }

  // Test 2: Register User
  let token = '';
  try {
    const register = await axios.post(`${API_URL}/api/auth/register`, {
      email: `quicktest${Date.now()}@example.com`,
      password: 'Test@1234',
      fullName: 'Quick Test User'
    });
    
    if (register.status === 201 && register.data.data.token) {
      log('✓ User registration passed', 'green');
      token = register.data.data.token;
      passed++;
    } else {
      throw new Error('Registration failed');
    }
  } catch (error) {
    log('✗ User registration failed', 'red');
    log(`  ${error.response?.data?.error || error.message}`, 'yellow');
    failed++;
  }

  // Test 3: Create Expense
  if (token) {
    try {
      const expense = await axios.post(
        `${API_URL}/api/expenses`,
        {
          date: new Date().toISOString(),
          category: 'Food',
          amount: 100,
          description: 'Quick test expense'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (expense.status === 201) {
        log('✓ Create expense passed', 'green');
        passed++;
      } else {
        throw new Error('Expense creation failed');
      }
    } catch (error) {
      log('✗ Create expense failed', 'red');
      log(`  ${error.response?.data?.error || error.message}`, 'yellow');
      failed++;
    }

    // Test 4: Get Expenses
    try {
      const expenses = await axios.get(`${API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (expenses.status === 200 && expenses.data.pagination) {
        log('✓ Get expenses passed', 'green');
        log(`  Total: ${expenses.data.pagination.total}`, 'cyan');
        passed++;
      } else {
        throw new Error('Get expenses failed');
      }
    } catch (error) {
      log('✗ Get expenses failed', 'red');
      log(`  ${error.response?.data?.error || error.message}`, 'yellow');
      failed++;
    }
  }

  // Summary
  log('\n' + '='.repeat(40), 'cyan');
  log(`Results: ${passed} passed, ${failed} failed`, passed === 4 ? 'green' : 'yellow');
  log('='.repeat(40) + '\n', 'cyan');

  if (failed === 0) {
    log('🎉 All quick tests passed!', 'green');
    log('Backend is working correctly!\n', 'green');
  } else {
    log('⚠️  Some tests failed', 'yellow');
    log('Please check the server logs\n', 'yellow');
  }

  process.exit(failed > 0 ? 1 : 0);
}

quickTest().catch(error => {
  log('\n❌ Test failed:', 'red');
  log(error.message, 'yellow');
  process.exit(1);
});
