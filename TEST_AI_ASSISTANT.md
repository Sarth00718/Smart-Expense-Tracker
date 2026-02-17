# How to Test the AI Assistant Fix

## Quick Start

1. **Start the server:**
   ```bash
   cd server
   npm start
   ```

2. **Start the client:**
   ```bash
   cd client
   npm run dev
   ```

3. **Navigate to AI Assistant:**
   - Login to your app
   - Click on "AI Finance Assistant" in the sidebar

## Test Scenarios

### ✅ Test 1: Affordability Analysis
**What to test:** The AI should correctly show your income when analyzing affordability

**Steps:**
1. In the AI chat, type: `Can I afford a ₹5,000 phone this month?`
2. Press Send

**Expected Result:**
```
🔍 Affordability Analysis for ₹5000.00:

📊 Current Month Status:
• Income: ₹5000.00 (not ₹0.00!)
• Expenses: ₹1256.00
• Current Balance: ₹3744.00
• Days Remaining: 11

❌ NOT RECOMMENDED

⚠️ This purchase would exceed your current balance by ₹1256.00.

💡 Suggestion: Wait until next month or consider a smaller amount.
```

**What to check:**
- ✅ Income shows ₹5000.00 (not ₹0.00)
- ✅ Current Balance is calculated correctly (₹5000 - ₹1256 = ₹3744)
- ✅ Recommendation is accurate based on actual balance

---

### ✅ Test 2: Income Query
**What to test:** The AI should show detailed income information

**Steps:**
1. Type: `How much income do I have this month?`
2. Press Send

**Expected Result:**
```
💰 This Month's Income:

You have ₹5000.00 in income for February 2026 from 1 transaction:

THIS MONTH'S INCOME DETAILS:
- February 14: Other - ₹5000.00 (Father give for fees)

Your current balance is ₹3744.00 after expenses.
```

**What to check:**
- ✅ Shows correct total income (₹5000)
- ✅ Lists individual transactions with dates
- ✅ Shows source and description

---

### ✅ Test 3: General Financial Overview
**What to test:** The AI provides accurate financial summary

**Steps:**
1. Type: `What's my financial situation this month?`
2. Press Send

**Expected Result:**
```
📊 Your Financial Overview for February 2026:

THIS MONTH:
• Income: ₹5000.00
• Expenses: ₹1256.00
• Current Balance: ₹3744.00
• Days Remaining: 11

You're doing well! You have a positive balance of ₹3744.00 with 11 days left in the month.
```

**What to check:**
- ✅ Income is not ₹0.00
- ✅ All calculations are correct
- ✅ Provides helpful context

---

### ✅ Test 4: Quick Question Buttons
**What to test:** Pre-filled questions work correctly

**Steps:**
1. Click the button: `📱 Can I afford ₹5K?`
2. Press Send

**Expected Result:**
- Same as Test 1 - should show correct income and affordability analysis

---

### ✅ Test 5: Voice Input (if supported)
**What to test:** Voice input captures affordability questions

**Steps:**
1. Click the microphone icon 🎤
2. Say: "Can I afford five thousand rupees this month?"
3. Press Send

**Expected Result:**
- Voice should be transcribed correctly
- AI should respond with affordability analysis showing correct income

---

## Debugging

### If Income Still Shows ₹0.00

1. **Check server logs:**
   ```bash
   # Look for these debug messages in server console:
   🔍 AI Context Debug:
   Total incomes in DB: 1
   Current month incomes: 1
   Sample income dates: [...]
   ```

2. **Verify income exists in database:**
   - Go to Income page
   - Check if you see your ₹5000 income entry
   - Note the date (should be February 14, 2026)

3. **Check date format:**
   - Income date should be in current month (February 2026)
   - If income is from a different month, add a new income for current month

4. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   cd server
   npm start
   ```

### If Affordability Analysis Doesn't Appear

1. **Check the query format:**
   - Must include words: "afford", "buy", or "purchase"
   - Must include an amount: ₹5000 or 5000

2. **Try exact test query:**
   ```
   Can I afford a ₹5,000 phone this month?
   ```

3. **Check server console for errors:**
   - Look for any error messages
   - Check if AI route is being called

### If AI Gives Wrong Information

1. **Check the context being sent:**
   - Server logs show the financial context
   - Verify income and expense totals match your data

2. **Try refreshing the page:**
   - Sometimes cached data causes issues
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Clear conversation and start new:**
   - Click "New Chat" button
   - Try the query again

---

## Success Criteria

The fix is working correctly if:

1. ✅ AI shows correct income amount (not ₹0.00)
2. ✅ Affordability analysis uses actual balance
3. ✅ Income queries show transaction details
4. ✅ All calculations are mathematically correct
5. ✅ Recommendations are based on real data

---

## Common Issues & Solutions

### Issue: "No income recorded for this month yet"
**Solution:** Add income for current month (February 2026)
1. Go to Income page
2. Click "+ Add Income"
3. Enter amount, source, and date (current month)
4. Save and test AI again

### Issue: Income shows but affordability is wrong
**Solution:** Check expense data
1. Go to Expenses page
2. Verify total expenses match what AI shows
3. Ensure expenses are in current month

### Issue: AI response is slow
**Solution:** This is normal for AI queries
- Rule-based affordability: ~1-2 seconds
- AI-powered responses: ~3-5 seconds
- If > 10 seconds, check internet connection

---

## Need Help?

If the AI still shows incorrect income after following this guide:

1. Check `AI_ASSISTANT_FIX.md` for technical details
2. Review server logs for error messages
3. Verify database has income records
4. Ensure server and client are both running
5. Try with a fresh browser session (incognito mode)

---

**Last Updated:** February 18, 2026
**Fix Version:** 1.0
**Status:** ✅ Ready for Testing
