# 🚀 Quick Start Guide - Smart Expense Tracker

**Welcome!** This guide will help you get started with all 4 advanced features in under 5 minutes.

---

## 📋 Table of Contents

1. [First Time Setup](#first-time-setup)
2. [Feature 1: Voice Input](#1-voice-input)
3. [Feature 2: Advanced Search](#2-advanced-search)
4. [Feature 3: Two-Factor Authentication](#3-two-factor-authentication)
5. [Feature 4: Expense Templates](#4-expense-templates)
6. [Tips & Tricks](#tips--tricks)

---

## First Time Setup

### Step 1: Install & Run

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start the app
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### Step 2: Create Account

1. Open http://localhost:5173
2. Click "Create an account"
3. Fill in your details
4. Click "Sign Up"

### Step 3: Add Your First Expense

1. Go to Dashboard
2. Click "Expenses" in sidebar
3. Fill the form and click "Add Expense"

**Now you're ready to use the advanced features!**

---

## 1. 🎤 Voice Input

### What is it?
Add expenses by speaking naturally - no typing required!

### How to use:

#### Step 1: Open Voice Input
- Go to **Expenses** page
- Click the **purple "Voice Input"** button

#### Step 2: Grant Permission
- Browser will ask for microphone access
- Click "Allow"

#### Step 3: Speak Your Expense
Say something like:
- "Add 50 rupees grocery expense"
- "Add 200 rupees uber ride"
- "Add 1000 rupees restaurant bill"

#### Step 4: Review & Confirm
- System extracts: amount, category, description
- Edit if needed
- Click "Create Expense"

### Tips:
✅ Speak clearly and naturally  
✅ Include amount, category, and description  
✅ Works best in Chrome and Safari  
✅ Requires HTTPS in production  

### Example Commands:
```
"Add 50 rupees grocery expense"
→ Amount: 50, Category: Food, Description: Grocery expense

"Add 200 rupees uber to office"
→ Amount: 200, Category: Travel, Description: Uber to office

"Add 1500 rupees dinner at restaurant"
→ Amount: 1500, Category: Food, Description: Dinner at restaurant
```

---

## 2. 🔍 Advanced Search

### What is it?
Find expenses with powerful filters and save your favorite searches.

### How to use:

#### Step 1: Open Advanced Search
- Go to **Expenses** page
- Click the **blue "Advanced Search"** button

#### Step 2: Set Your Filters

**Date Range:**
- Select start and end dates
- Or use quick presets (Today, Last 7 days, This month)

**Amount Range:**
- Set minimum amount (e.g., ₹100)
- Set maximum amount (e.g., ₹5000)

**Categories:**
- Select one or more categories
- Options: Food, Travel, Shopping, Bills, etc.

**Payment Mode:**
- Choose: Cash, Card, UPI, Net Banking

**Text Search:**
- Search in descriptions
- Example: "restaurant", "uber", "grocery"

#### Step 3: Search
- Click "Search" button
- View results with statistics

#### Step 4: Save Filter (Optional)
- Click "Save Filter"
- Give it a name (e.g., "Monthly Dining")
- Load anytime from saved filters

### Tips:
✅ Combine multiple filters for precise results  
✅ Save frequently used filters  
✅ Check statistics for insights  
✅ Clear results to see all expenses  

### Example Searches:

**Find all food expenses over ₹500 this month:**
```
Date: This month
Amount: ₹500 - ₹999999
Category: Food
```

**Find all UPI payments last week:**
```
Date: Last 7 days
Payment Mode: UPI
```

**Find restaurant expenses:**
```
Text Search: "restaurant"
Category: Food
```

---

## 3. 🔒 Two-Factor Authentication

### What is it?
Add an extra layer of security to your account with 2FA.

### How to use:

#### Step 1: Go to Settings
- Click **"Settings"** in sidebar
- Click **"Security"** tab

#### Step 2: Enable 2FA
- Click **"Enable 2FA"** button
- Choose your method:
  - **Email OTP**: Get code via email
  - **Authenticator App**: Use Google Authenticator

#### Option A: Email OTP

1. Click "Email OTP"
2. Check your email for 6-digit code
3. Enter code
4. Save 10 backup codes (important!)
5. Done! ✅

#### Option B: Authenticator App (More Secure)

1. Click "Authenticator App"
2. Open Google Authenticator on your phone
3. Scan the QR code
4. Enter 6-digit code from app
5. Save 10 backup codes (important!)
6. Done! ✅

#### Step 3: Test 2FA
1. Logout
2. Login with email and password
3. Enter 2FA code (from email or app)
4. Successfully logged in! ✅

### Tips:
✅ Save backup codes in a safe place  
✅ Use authenticator app for best security  
✅ Test backup codes before relying on them  
✅ Keep email accessible for OTP  

### Backup Codes:
- You get 10 one-time backup codes
- Use if you lose access to email/phone
- Each code works only once
- Regenerate anytime from Settings

---

## 4. 📝 Expense Templates

### What is it?
Create reusable templates for recurring expenses - one click to add!

### How to use:

#### Step 1: Go to Templates
- Click **"Templates"** in sidebar

#### Step 2: Create Template
- Click **"New Template"** button
- Fill in details:
  - **Name**: "Monthly Rent"
  - **Category**: Bills
  - **Amount**: 15000
  - **Payment Mode**: Net Banking
  - **Description**: "Monthly rent payment"
- Click "Save Template"

#### Step 3: Use Template
- Find your template in the list
- Click **"Use"** button
- Expense created instantly! ✅
- Usage count increments

#### Step 4: Manage Templates
- **Edit**: Update amount or details
- **Delete**: Remove unused templates
- **Sort**: By name, amount, or usage

### Tips:
✅ Create templates for recurring expenses  
✅ Use descriptive names  
✅ Update amounts as needed  
✅ Delete unused templates  

### Example Templates:

**Monthly Bills:**
```
Template: "Monthly Rent"
Category: Bills
Amount: ₹15,000
Payment: Net Banking
```

**Subscriptions:**
```
Template: "Netflix Subscription"
Category: Entertainment
Amount: ₹199
Payment: Card
```

**Regular Expenses:**
```
Template: "Weekly Groceries"
Category: Food
Amount: ₹2,000
Payment: UPI
```

---

## 🎯 Tips & Tricks

### Voice Input
- Speak in a quiet environment
- Use natural language
- Include all details in one sentence
- Review before confirming

### Advanced Search
- Start with broad filters, then narrow down
- Save filters you use often
- Use text search for specific items
- Check statistics for insights

### 2FA
- Enable 2FA for better security
- Use authenticator app (more secure than email)
- Save backup codes immediately
- Test backup codes once

### Templates
- Create templates for all recurring expenses
- Use clear, descriptive names
- Update amounts when they change
- Delete templates you no longer use

---

## 🔥 Power User Workflow

### Morning Routine:
1. Open app
2. Use **Voice Input**: "Add 50 rupees coffee"
3. Use **Template**: Click "Use" on "Uber to Office"
4. Done in 30 seconds! ⚡

### Weekly Review:
1. Go to Expenses
2. Use **Advanced Search**: "Last 7 days"
3. Check spending by category
4. Adjust budget if needed

### Monthly Analysis:
1. Use **Advanced Search**: "This month"
2. Filter by category
3. Compare with budget
4. Generate report

---

## 🆘 Troubleshooting

### Voice Input Not Working
- Check microphone permission
- Use Chrome or Safari
- Ensure HTTPS in production
- Check browser console

### 2FA Code Not Received
- Check spam folder
- Verify email in settings
- Use backup code
- Contact support

### Search Too Slow
- Reduce date range
- Use fewer filters
- Check internet connection
- Clear browser cache

### Template Not Saving
- Check all required fields
- Verify unique name
- Check internet connection
- Try different browser

---

## 📞 Need Help?

### Documentation
- **README.md** - Complete documentation
- **ALL_FEATURES_INTEGRATED.md** - Integration details
- **CURRENT_STATE_SUMMARY.md** - Technical details
- **FEATURE_STATUS.md** - Feature overview

### Support
- Email: support@yourapp.com
- GitHub: Open an issue
- Docs: Check documentation files

---

## ✅ Quick Checklist

After reading this guide, you should be able to:

- [ ] Add expense using voice input
- [ ] Search expenses with filters
- [ ] Enable 2FA on your account
- [ ] Create and use templates
- [ ] Save frequently used searches
- [ ] Manage backup codes
- [ ] Navigate all features

---

## 🎉 You're All Set!

You now know how to use all 4 advanced features:

1. ✅ **Voice Input** - Quick expense entry
2. ✅ **Advanced Search** - Powerful filtering
3. ✅ **2FA** - Enhanced security
4. ✅ **Templates** - Reusable expenses

**Start tracking smarter today!** 💰

---

**Questions?** Check the documentation or contact support.

**Happy tracking!** 🚀

---

*Last Updated: January 31, 2026*
