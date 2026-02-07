# Complete Authentication Guide

## Overview

The Smart Expense Tracker supports three authentication methods:
1. **Email & Password** (Backend MongoDB)
2. **Google Sign-In** (Firebase)
3. **Biometric Authentication** (WebAuthn - Fingerprint/Face ID)

All methods work seamlessly with the same email address (e.g., `sarthnarola007@gmail.com`).

## Authentication Flow

### Method 1: Email & Password

**Registration:**
```
1. Go to /register
2. Enter: Email, Password (min 6 chars), Full Name
3. Click "Create Account"
4. Automatically logged in and redirected to dashboard
```

**Login:**
```
1. Go to /login
2. Enter: Email, Password
3. Click "Sign In"
4. Redirected to dashboard
```

**Backend:** MongoDB User model with bcrypt password hashing

### Method 2: Google Sign-In

**First Time:**
```
1. Go to /login or /register
2. Click "Continue with Google"
3. Select Google account
4. Automatically creates account and logs in
5. Redirected to dashboard
```

**Subsequent Logins:**
```
1. Click "Continue with Google"
2. Auto-login with saved Google account
3. Redirected to dashboard
```

**Backend:** Firebase Authentication + MongoDB sync

### Method 3: Biometric Authentication

**Setup (Must be logged in first):**
```
1. Login with Email/Password or Google
2. Go to Settings → Biometric tab
3. Click "Register Biometric Authentication"
4. Follow device prompts (Touch ID, Face ID, Windows Hello)
5. Credential saved
```

**Login:**
```
1. Go to /login
2. Click "Sign in with Biometric"
3. Complete biometric verification
4. Redirected to dashboard
```

**Requirements:**
- HTTPS connection (or localhost)
- Device with biometric hardware
- Browser support for WebAuthn API

## Account Linking

All three methods can be used with the same email address. The system automatically links accounts:

**Scenario 1: Email → Google**
```
1. Register with email: sarthnarola007@gmail.com
2. Later, login with Google using same email
3. System links Firebase UID to existing MongoDB user
4. All data preserved
```

**Scenario 2: Google → Email**
```
1. Login with Google: sarthnarola007@gmail.com
2. System creates MongoDB user with Firebase UID
3. Later, can set password in Settings
4. Can login with either method
```

**Scenario 3: Any → Biometric**
```
1. Login with Email or Google
2. Register biometric in Settings
3. Biometric credential linked to MongoDB user
4. Can login with any of the three methods
```

## Troubleshooting

### Issue: Rate Limit Exceeded (429 Error)

**Cause:** Too many failed authentication attempts

**Solution:**
```bash
# Wait 15 minutes, or restart server to clear rate limits
cd server
npm run dev
```

**Prevention:** Rate limits are disabled in development mode

### Issue: Biometric Authentication Fails

**Possible Causes:**
1. No biometric credential registered
2. Credential expired or invalid
3. Browser doesn't support WebAuthn
4. Not using HTTPS (except localhost)

**Solutions:**

**A. Re-register Biometric:**
```
1. Login with Email/Password or Google
2. Go to Settings → Biometric
3. Remove old credentials
4. Register new credential
```

**B. Clear Local Storage:**
```javascript
// In browser console:
localStorage.removeItem('biometricCredentialId')
localStorage.removeItem('biometricEmail')
```

**C. Use Alternative Method:**
```
- Login with Email/Password
- Or login with Google
- Then re-register biometric
```

### Issue: "User Not Found" or "Invalid Credentials"

**For Email/Password:**
```
1. Verify email is correct
2. Check password (case-sensitive)
3. Try "Forgot Password" (if implemented)
4. Or register new account
```

**For Google:**
```
1. Ensure using correct Google account
2. Check browser allows popups
3. Try incognito mode
4. Clear browser cache
```

### Issue: Not Redirecting After Login

**Solution:**
```
1. Check browser console for errors
2. Clear browser cache and cookies
3. Ensure JavaScript is enabled
4. Try different browser
```

**Manual Fix:**
```javascript
// In browser console after successful login:
window.location.href = '/dashboard'
```

## Testing Authentication

### Test User Setup

**Create Test User:**
```bash
# Method 1: Via UI
1. Go to /register
2. Email: sarthnarola007@gmail.com
3. Password: Test@123
4. Full Name: Sarth Narola
5. Click "Create Account"

# Method 2: Via MongoDB
# Connect to MongoDB and insert:
{
  email: "sarthnarola007@gmail.com",
  password: "$2a$10$...", // bcrypt hash
  fullName: "Sarth Narola",
  authProvider: "backend"
}
```

### Test All Methods

**1. Email/Password:**
```
✓ Register new account
✓ Login with credentials
✓ Logout
✓ Login again
✓ Navigate between pages
✓ Refresh page (should stay logged in)
```

**2. Google Sign-In:**
```
✓ Click "Continue with Google"
✓ Select Google account
✓ Verify redirect to dashboard
✓ Logout
✓ Login with Google again
✓ Verify data persists
```

**3. Biometric:**
```
✓ Login with Email/Google first
✓ Go to Settings → Biometric
✓ Register biometric credential
✓ Logout
✓ Click "Sign in with Biometric"
✓ Complete biometric verification
✓ Verify redirect to dashboard
```

### Test Account Linking

**Test 1: Email → Google → Biometric**
```
1. Register: sarthnarola007@gmail.com (Email/Password)
2. Add some expenses
3. Logout
4. Login with Google (same email)
5. Verify expenses still there
6. Register biometric
7. Logout
8. Login with biometric
9. Verify all data intact
```

**Test 2: Google → Email → Biometric**
```
1. Login with Google: sarthnarola007@gmail.com
2. Add some expenses
3. Logout
4. Login with Email/Password (same email)
5. Verify expenses still there
6. Register biometric
7. Test all three methods
```

## Reset Authentication

### Clear User's Biometric Credentials

```bash
cd server
node utils/resetAuth.js sarthnarola007@gmail.com
```

### Clear All Local Storage

```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Reset Rate Limits

```bash
# Restart server
cd server
npm run dev
```

## Security Best Practices

### For Users

1. **Use Strong Passwords**
   - Minimum 6 characters (8+ recommended)
   - Mix of letters, numbers, symbols
   - Don't reuse passwords

2. **Enable Biometric**
   - More secure than passwords
   - Faster login
   - Device-specific

3. **Logout on Shared Devices**
   - Always logout when done
   - Don't save passwords on public computers

### For Developers

1. **Environment Variables**
   ```bash
   JWT_SECRET=your-secret-key-here
   MONGODB_URI=mongodb://...
   FIREBASE_API_KEY=...
   ```

2. **HTTPS in Production**
   - Required for biometric
   - Protects credentials in transit

3. **Rate Limiting**
   - Prevents brute force attacks
   - Adjust limits as needed

4. **Token Expiration**
   - JWT tokens expire in 7 days
   - Refresh tokens on activity

## API Endpoints

### Authentication

```
POST /api/auth/register
Body: { email, password, fullName }
Response: { token, user }

POST /api/auth/login
Body: { email, password }
Response: { token, user }

POST /api/auth/firebase-sync
Body: { uid, email, fullName, picture }
Response: { token, user }

GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user }
```

### Biometric

```
POST /api/biometric/register
Headers: { Authorization: Bearer <token> }
Body: { credentialId, publicKey, counter }
Response: { message, credentialId }

POST /api/biometric/authenticate
Body: { email, credentialId, signature, authenticatorData, clientDataJSON }
Response: { token, user }

GET /api/biometric/credentials
Headers: { Authorization: Bearer <token> }
Response: { credentials: [] }

DELETE /api/biometric/credentials/:credentialId
Headers: { Authorization: Bearer <token> }
Response: { message }
```

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body/params |
| 401 | Unauthorized | Invalid credentials or token |
| 404 | Not Found | User or resource doesn't exist |
| 429 | Too Many Requests | Wait or restart server |
| 500 | Server Error | Check server logs |

## Support

For authentication issues:

1. Check browser console for errors
2. Check server logs
3. Verify environment variables
4. Test with different browser
5. Clear cache and cookies
6. Try incognito mode

---

**Last Updated:** February 2026  
**Version:** 2.0.1
