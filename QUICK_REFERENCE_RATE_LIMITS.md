# Quick Reference: Rate Limit Configuration

## Current Rate Limits (Production)

### Authentication Routes (`/api/auth/*`, `/api/biometric/*`)
- **Limit**: 30 requests per 15 minutes
- **Window**: 15 minutes
- **Applies to**: Login, Register, Google Sign-in, Biometric auth
- **Note**: Successful requests don't count toward limit

### AI Routes (`/api/ai/*`)
- **Limit**: 50 requests per minute
- **Window**: 1 minute
- **Applies to**: AI chatbot, recommendations, suggestions

### Health Check (`/api/health/*`)
- **Limit**: NONE (unlimited)
- **Applies to**: Health checks, ping endpoints

### All Other Routes
- **Limit**: NONE (unlimited in development)
- **Note**: In production, consider adding moderate limits if needed

## Development Mode
- **All rate limits**: DISABLED
- **Caching**: ENABLED
- **Throttling**: ENABLED

## Client-Side Optimizations

### Request Caching
- **GET requests**: Cached for 30 seconds
- **Stale cache**: Used for 5 minutes on rate limit
- **Auto cleanup**: Every 5 minutes

### Request Throttling
- **getExpenses**: Max once per 2 seconds
- **getSummary**: Max once per 5 seconds

### Request Deduplication
- **Automatic**: Identical simultaneous requests merged
- **Scope**: Per request URL + parameters

## How to Adjust Limits

### Server-Side (`server/src/middleware/rateLimiter.js`):
```javascript
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,        // Time window
  max: 500,                    // Max requests
  message: { error: '...' }    // Error message
})
```

### Client-Side (`client/src/services/expenseService.js`):
```javascript
const throttled = throttleRequest(fn, 2000) // 2 second throttle
```

## Monitoring

### Check Rate Limit Headers:
```javascript
// Response headers
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: 1234567890
```

### Console Logs:
- Cache hits/misses
- Deduplicated requests
- Rate limit warnings

## Troubleshooting

### Still Getting 429 Errors?
1. Check if in production mode (limits are stricter)
2. Clear browser cache
3. Check for infinite loops in code
4. Verify request deduplication is working
5. Check server logs for actual request count

### Cache Not Working?
1. Verify `skipCache: false` in request config
2. Check browser console for cache logs
3. Clear cache manually: `requestCache.clearAll()`

### Performance Issues?
1. Enable caching for more endpoints
2. Increase throttle delays
3. Implement request batching
4. Use lazy loading for components

## Best Practices

1. ✅ Use caching for read-heavy operations
2. ✅ Throttle expensive operations
3. ✅ Deduplicate identical requests
4. ✅ Batch multiple operations
5. ✅ Lazy load heavy components
6. ✅ Handle rate limit errors gracefully
7. ✅ Monitor rate limit headers
8. ✅ Test under load before deploying

## Emergency: Disable All Rate Limits

### Server (NOT RECOMMENDED):
```javascript
// In rateLimiter.js
skip: () => true  // Disables all rate limiting
```

### Client:
```javascript
// In api.js
config.skipCache = true  // Disables caching
```

## Contact

For rate limit adjustments or issues, check:
- `RATE_LIMIT_FIXES.md` - Detailed documentation
- `PERFORMANCE_OPTIMIZATIONS.md` - Performance guide
- Server logs - Real-time monitoring
