# Smart Expense Tracker — API Endpoints Reference

**Base URL:** `http://localhost:5000/api`  
**Auth:** All protected routes require `Authorization: Bearer <token>` header.

---

## 🏥 Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Full health check (DB status, uptime) |
| GET | `/health/ping` | ❌ | Lightweight ping / keep-alive |

---

## 🔐 Auth  `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login with email + password |
| GET | `/auth/me` | ✅ | Get current authenticated user |
| POST | `/auth/firebase-sync` | ❌ | Sync / login via Firebase token |
| POST | `/auth/link-firebase` | ✅ | Link Firebase account to existing user |

### Request Bodies

**POST `/auth/register`**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**POST `/auth/login`**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**POST `/auth/firebase-sync`**
```json
{
  "firebaseToken": "<firebase_id_token>"
}
```

**POST `/auth/link-firebase`**
```json
{
  "firebaseToken": "<firebase_id_token>"
}
```

---

## 💸 Expenses  `/api/expenses`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/expenses` | ✅ | Get all expenses (paginated) |
| POST | `/expenses` | ✅ | Create a new expense |
| DELETE | `/expenses` | ✅ | Delete ALL expenses for user |
| GET | `/expenses/filter` | ✅ | Filter expenses by query params |
| GET | `/expenses/categories` | ✅ | Get distinct expense categories |
| GET | `/expenses/summary` | ✅ | Get expense summary stats |
| GET | `/expenses/recent/:limit` | ✅ | Get N most recent expenses |
| POST | `/expenses/search` | ✅ | Full-text search expenses |
| PUT | `/expenses/:id` | ✅ | Update an expense by ID |
| DELETE | `/expenses/:id` | ✅ | Delete an expense by ID |

### Request Bodies

**POST `/expenses`**
```json
{
  "amount": 250.00,
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2026-05-31",
  "paymentMode": "UPI",
  "tags": ["lunch", "work"],
  "isRecurring": false
}
```

**POST `/expenses/search`**
```json
{
  "query": "restaurant",
  "startDate": "2026-05-01",
  "endDate": "2026-05-31"
}
```

---

## 💰 Income  `/api/income`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/income` | ✅ | Get all income records |
| POST | `/income` | ✅ | Create a new income record |
| GET | `/income/sources` | ✅ | Get distinct income sources |
| GET | `/income/summary` | ✅ | Get income summary stats |
| PUT | `/income/:id` | ✅ | Update an income record |
| DELETE | `/income/:id` | ✅ | Delete an income record |

### Request Bodies

**POST `/income`**
```json
{
  "amount": 50000,
  "source": "Salary",
  "description": "Monthly salary",
  "date": "2026-05-01",
  "isRecurring": true
}
```

---

## 📊 Budgets  `/api/budgets`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/budgets` | ✅ | Get all budgets |
| POST | `/budgets` | ✅ | Create / upsert a budget |
| DELETE | `/budgets/:category` | ✅ | Delete budget for a category |

### Request Bodies

**POST `/budgets`**
```json
{
  "category": "Food",
  "monthlyBudget": 8000,
  "alertThreshold": 80
}
```

---

## 🎯 Goals  `/api/goals`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/goals` | ✅ | Get all savings goals |
| POST | `/goals` | ✅ | Create a new goal |
| GET | `/goals/stats` | ✅ | Get goals aggregate stats |
| PUT | `/goals/:id` | ✅ | Update a goal |
| DELETE | `/goals/:id` | ✅ | Delete a goal |

### Request Bodies

**POST `/goals`**
```json
{
  "name": "Emergency Fund",
  "targetAmount": 100000,
  "currentAmount": 20000,
  "deadline": "2026-12-31",
  "category": "Savings"
}
```

---

## 📈 Analytics  `/api/analytics`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/dashboard` | ✅ | Full dashboard analytics |
| GET | `/analytics/heatmap` | ✅ | Daily spending heatmap data |
| GET | `/analytics/patterns` | ✅ | Spending pattern analysis |
| GET | `/analytics/predictions` | ✅ | AI-powered spend predictions |
| GET | `/analytics/score` | ✅ | Financial health score |

---

## 🤖 AI  `/api/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/ai/chat` | ✅ | Send message to AI finance bot |
| GET | `/ai/suggestions` | ✅ | Get AI-powered financial suggestions |
| GET | `/ai/conversations` | ✅ | List all chat conversations |
| POST | `/ai/conversations/new` | ✅ | Start a new conversation |
| GET | `/ai/conversations/:conversationId` | ✅ | Get a specific conversation |
| DELETE | `/ai/conversations/:conversationId` | ✅ | Delete a conversation |

### Request Bodies

**POST `/ai/chat`**
```json
{
  "message": "How much did I spend on food this month?",
  "conversationId": "optional-existing-conversation-id"
}
```

### Query Params — `/ai/suggestions`

| Param | Values | Default |
|-------|--------|---------|
| `type` | `general`, `budget`, `forecast` | `general` |

---

## 🏆 Achievements  `/api/achievements`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/achievements` | ✅ | Get all user achievements |

---

## 🧾 Receipts  `/api/receipts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/receipts/scan` | ✅ | Scan receipt image (multipart/form-data) |
| POST | `/receipts/scan-base64` | ✅ | Scan receipt from base64 string |

### Request Bodies

**POST `/receipts/scan`** — `Content-Type: multipart/form-data`
```
receipt: <image file>      (required)
categoryHint: "Food"       (optional)
```

**POST `/receipts/scan-base64`**
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "categoryHint": "Food"
}
```

---

## 💡 Budget Recommendations  `/api/budget-recommendations`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/budget-recommendations` | ✅ | Get AI-driven budget recommendations |

---

## 📄 Reports  `/api/reports`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports/pdf` | ✅ | Download PDF financial report |

### Query Params — `/reports/pdf`

| Param | Type | Default |
|-------|------|---------|
| `startDate` | ISO date string | Start of current month |
| `endDate` | ISO date string | Today |

---

## 🎙️ Voice  `/api/voice`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/voice/parse` | ✅ | Parse voice transcript → expense data |
| POST | `/voice/expense` | ✅ | Create expense from voice transcript |

### Request Bodies

**POST `/voice/parse`**
```json
{
  "transcript": "spent 250 rupees on lunch today"
}
```

**POST `/voice/expense`**
```json
{
  "transcript": "spent 250 rupees on lunch today",
  "date": "2026-05-31"
}
```

---

## 🔍 Filters  `/api/filters`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/filters` | ✅ | Get all saved filters |
| POST | `/filters` | ✅ | Create a saved filter |
| POST | `/filters/search` | ✅ | Advanced expense search |
| GET | `/filters/quick/:preset` | ✅ | Apply quick filter preset |
| PUT | `/filters/:id` | ✅ | Update a saved filter |
| DELETE | `/filters/:id` | ✅ | Delete a saved filter |

### Quick Filter Presets

`today` · `yesterday` · `last7days` · `last30days` · `thisMonth` · `lastMonth`

### Request Bodies

**POST `/filters`**
```json
{
  "name": "High Food Spending",
  "filters": { "categories": ["Food"], "amountRange": { "min": 500 } },
  "isDefault": false
}
```

**POST `/filters/search`**
```json
{
  "dateRange": { "start": "2026-05-01", "end": "2026-05-31" },
  "amountRange": { "min": 100, "max": 5000 },
  "categories": ["Food", "Transport"],
  "paymentModes": ["UPI"],
  "tags": ["work"],
  "searchText": "restaurant",
  "page": 1,
  "limit": 50
}
```

---

## 👤 Users  `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile/stats` | ✅ | Get user profile statistics |
| PUT | `/users/profile` | ✅ | Update user profile |
| GET | `/users/preferences` | ✅ | Get user preferences |
| PATCH | `/users/preferences` | ✅ | Update user preferences |
| PUT | `/users/change-password` | ✅ | Change password |
| GET | `/users/sessions` | ✅ | Get active sessions |
| DELETE | `/users/sessions/:sessionId` | ✅ | Revoke a session |

### Request Bodies

**PUT `/users/profile`**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "picture": "https://..."
}
```

**PATCH `/users/preferences`**
```json
{
  "colorScheme": "blue"
}
```
> `colorScheme` options: `blue` · `green` · `purple` · `orange` · `pink`

**PUT `/users/change-password`**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

---

## 📤 Export  `/api/export`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/export/expenses` | ✅ | Export expenses (CSV or JSON) |
| GET | `/export/income` | ✅ | Export income (CSV or JSON) |
| GET | `/export/all` | ✅ | Export all financial data (JSON) |
| GET | `/export/all-csv` | ✅ | Export all financial data (CSV) |
| GET | `/export/comprehensive-pdf` | ✅ | Download comprehensive PDF report |

### Query Params — Export Endpoints

| Param | Type | Description |
|-------|------|-------------|
| `format` | `csv` / `json` | Export format (default: `csv`) |
| `startDate` | ISO date | Filter start date |
| `endDate` | ISO date | Filter end date |

---

## 🔒 Biometric  `/api/biometric`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/biometric/register` | ✅ | Register a biometric credential |
| POST | `/biometric/authenticate` | ❌ | Authenticate with biometric |
| GET | `/biometric/credentials` | ✅ | List registered credentials |
| DELETE | `/biometric/credentials/:credentialId` | ✅ | Remove a credential |

### Request Bodies

**POST `/biometric/register`**
```json
{
  "credentialId": "abc123",
  "publicKey": "base64encodedpublickey",
  "counter": 0
}
```

**POST `/biometric/authenticate`**
```json
{
  "email": "john@example.com",
  "credentialId": "abc123",
  "signature": "...",
  "authenticatorData": "...",
  "clientDataJSON": "..."
}
```

---

## 📊 Endpoint Summary

| Module | Endpoints |
|--------|-----------|
| Health | 2 |
| Auth | 5 |
| Expenses | 10 |
| Income | 6 |
| Budgets | 3 |
| Goals | 5 |
| Analytics | 5 |
| AI | 6 |
| Achievements | 1 |
| Receipts | 2 |
| Budget Recommendations | 1 |
| Reports | 1 |
| Voice | 2 |
| Filters | 6 |
| Users | 7 |
| Export | 5 |
| Biometric | 4 |
| **Total** | **71** |
