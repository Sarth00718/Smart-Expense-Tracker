#!/usr/bin/env node

/**
 * Load Testing Script
 * Tests API performance under load
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS) || 10;
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER) || 5;

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

async function registerUser(userId) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      email: `loadtest${userId}_${Date.now()}@example.com`,
      password: 'Test@1234',
      fullName: `Load Test User ${userId}`
    });
    return response.data.data.token;
  } catch (error) {
    return null;
  }
}

async function makeRequest(token, requestNum) {
  const startTime = Date.now();
  try {
    await axios.post(
      `${API_URL}/api/expenses`,
      {
        date: new Date().toISOString(),
        category: 'Food',
        amount: Math.floor(Math.random() * 1000) + 100,
        description: `Load test expense ${requestNum}`
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, duration: Date.now() - startTime };
  } catch (error) {
    return { success: false, duration: Date.now() - startTime, error: error.message };
  }
}

async function simulateUser(userId) {
  const token = await registerUser(userId);
  if (!token) {
    return { userId, success: false, requests: [] };
  }

  const requests = [];
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const result = await makeRequest(token, i + 1);
    requests.push(result);
  }

  return { userId, success: true, requests };
}

async function runLoadTest() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║          Load Testing - Smart Expense Tracker             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\nConfiguration:`, 'yellow');
  log(`  API URL: ${API_URL}`, 'cyan');
  log(`  Concurrent Users: ${CONCURRENT_USERS}`, 'cyan');
  log(`  Requests per User: ${REQUESTS_PER_USER}`, 'cyan');
  log(`  Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`, 'cyan');
  
  log('\n🚀 Starting load test...\n', 'yellow');

  const startTime = Date.now();

  // Simulate concurrent users
  const userPromises = [];
  for (let i = 1; i <= CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i));
  }

  const results = await Promise.all(userPromises);
  const duration = (Date.now() - startTime) / 1000;

  // Analyze results
  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  const durations = [];

  results.forEach(user => {
    if (user.success) {
      user.requests.forEach(req => {
        totalRequests++;
        if (req.success) {
          successfulRequests++;
          durations.push(req.duration);
        } else {
          failedRequests++;
        }
      });
    }
  });

  // Calculate statistics
  const avgDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const requestsPerSecond = totalRequests / duration;
  const successRate = (successfulRequests / totalRequests) * 100;

  // Print results
  log('='.repeat(60), 'cyan');
  log('Load Test Results', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\nTotal Duration: ${duration.toFixed(2)}s`, 'yellow');
  log(`Total Requests: ${totalRequests}`, 'cyan');
  log(`Successful: ${successfulRequests}`, 'green');
  log(`Failed: ${failedRequests}`, failedRequests > 0 ? 'red' : 'green');
  log(`Success Rate: ${successRate.toFixed(1)}%`, successRate >= 95 ? 'green' : 'yellow');
  
  log(`\nPerformance Metrics:`, 'yellow');
  log(`  Requests/sec: ${requestsPerSecond.toFixed(2)}`, 'cyan');
  log(`  Avg Response Time: ${avgDuration.toFixed(0)}ms`, 'cyan');
  log(`  Min Response Time: ${minDuration}ms`, 'cyan');
  log(`  Max Response Time: ${maxDuration}ms`, 'cyan');

  // Performance rating
  log(`\nPerformance Rating:`, 'yellow');
  if (avgDuration < 200) {
    log('  ⭐⭐⭐⭐⭐ Excellent (< 200ms)', 'green');
  } else if (avgDuration < 500) {
    log('  ⭐⭐⭐⭐ Good (< 500ms)', 'green');
  } else if (avgDuration < 1000) {
    log('  ⭐⭐⭐ Fair (< 1s)', 'yellow');
  } else {
    log('  ⭐⭐ Needs Improvement (> 1s)', 'red');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');

  if (successRate >= 95) {
    log('🎉 Load test passed! API is performing well under load.', 'green');
  } else {
    log('⚠️  Load test completed with some failures.', 'yellow');
  }

  process.exit(failedRequests > totalRequests * 0.05 ? 1 : 0);
}

runLoadTest().catch(error => {
  log('\n❌ Load test failed:', 'red');
  log(error.message, 'yellow');
  process.exit(1);
});
