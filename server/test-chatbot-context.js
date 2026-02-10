/**
 * Test script to verify chatbot context understanding
 * Run with: node test-chatbot-context.js
 */

require('dotenv').config();

// Mock data for testing
const mockExpenses = [
  { category: 'Food', amount: 2135.85, date: new Date('2025-02-05'), description: 'Vadapav and soda' },
  { category: 'Food', amount: 110.00, date: new Date('2025-02-08'), description: 'Burger and lassi' },
  { category: 'Food', amount: 73.00, date: new Date('2025-02-10'), description: 'Gathiya and thepla' },
  { category: 'Transport', amount: 500.00, date: new Date('2025-02-03'), description: 'Uber ride' },
  { category: 'Shopping', amount: 1500.00, date: new Date('2025-02-01'), description: 'Clothes' },
  { category: 'Food', amount: 5000.00, date: new Date('2025-01-15'), description: 'Last month food' },
];

const mockBudgets = [
  { category: 'Food', monthlyBudget: 2000 }
];

// Test the context building
function testContextBuilding() {
  console.log('🧪 Testing Chatbot Context Understanding\n');
  console.log('═'.repeat(60));
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[currentMonth];
  
  console.log(`\n📅 Current Date: ${currentMonthName} ${now.getDate()}, ${currentYear}`);
  console.log(`📊 Test Data: ${mockExpenses.length} expenses, ${mockBudgets.length} budgets\n`);
  
  // Calculate current month expenses
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const monthExpenses = mockExpenses.filter(exp => new Date(exp.date) >= startOfMonth);
  
  console.log('✅ Current Month Expenses:');
  monthExpenses.forEach(exp => {
    console.log(`   • ${exp.date.toLocaleDateString()}: ${exp.category} - ₹${exp.amount} (${exp.description})`);
  });
  
  const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  console.log(`   Total: ₹${monthTotal.toFixed(2)}\n`);
  
  // Calculate Food category for current month
  const foodExpenses = monthExpenses.filter(exp => exp.category === 'Food');
  const foodTotal = foodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  console.log('🍔 Food Expenses This Month:');
  console.log(`   Total: ₹${foodTotal.toFixed(2)}`);
  console.log(`   Transactions: ${foodExpenses.length}`);
  console.log(`   Budget: ₹${mockBudgets[0].monthlyBudget}`);
  console.log(`   Over Budget: ₹${(foodTotal - mockBudgets[0].monthlyBudget).toFixed(2)}`);
  console.log(`   Percentage: ${((foodTotal / mockBudgets[0].monthlyBudget) * 100).toFixed(1)}%\n`);
  
  console.log('═'.repeat(60));
  console.log('\n✅ Context Test Complete!');
  console.log('\n💡 Expected Behavior:');
  console.log('   When user asks: "what is the current food expense in these month?"');
  console.log(`   Bot should respond with: ₹${foodTotal.toFixed(2)} for ${currentMonthName} ${currentYear}`);
  console.log(`   And mention: Over budget by ₹${(foodTotal - mockBudgets[0].monthlyBudget).toFixed(2)}\n`);
  
  console.log('📝 Test Queries to Try:');
  console.log('   1. "what is the current food expense in these month?"');
  console.log('   2. "how much did I spend on food this month?"');
  console.log('   3. "show me my food spending for this month"');
  console.log('   4. "current month food expenses"');
  console.log('   5. "am I over budget on food?"\n');
}

// Run the test
testContextBuilding();
