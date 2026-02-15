# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

## Expenses

### Create Expense
**POST** `/expenses`

**Request Body:**
```json
{
  "date": "2024-01-15",
  "category": "Food",
  "amount": 45.50,
  "description": "Lunch at restaurant",
  "paymentMode": "Card",
  "isRecurring": false
}
```

**Response:** `201 Created`

### Get All Expenses
**GET** `/expenses?page=1&limit=50`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `category` (optional): Filter by category
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

### Update Expense
**PUT** `/expenses/:id`

**Request Body:** (all fields optional)
```json
{
  "amount": 50.00,
  "description": "Updated description"
}
```

**Response:** `200 OK`

### Delete Expense
**DELETE** `/expenses/:id`

**Response:** `200 OK`

### Get Expense Summary
**GET** `/expenses/summary`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_expenses": 5000.00,
    "this_month": 1200.00,
    "categories": [
      {
        "category": "Food",
        "total": 500.00,
        "count": 15
      }
    ]
  }
}
```

## Income

### Create Income
**POST** `/income`

**Request Body:**
```json
{
  "date": "2024-01-01",
  "source": "Salary",
  "amount": 5000.00,
  "description": "Monthly salary",
  "isRecurring": true
}
```

**Response:** `201 Created`

### Get All Income
**GET** `/income?page=1&limit=50`

**Response:** `200 OK`

### Get Income Summary
**GET** `/income/summary`

**Response:** `200 OK`

## Budgets

### Get All Budgets
**GET** `/budgets`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "category": "Food",
      "monthlyBudget": 500.00,
      "spent": 350.00,
      "remaining": 150.00,
      "percentage": 70
    }
  ]
}
```

### Set Budget
**POST** `/budgets`

**Request Body:**
```json
{
  "category": "Food",
  "monthlyBudget": 500.00
}
```

**Response:** `200 OK`

### Delete Budget
**DELETE** `/budgets/:category`

**Response:** `200 OK`

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## Rate Limiting

- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- AI endpoints: 10 requests per 15 minutes
