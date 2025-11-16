# iPhone Chrome API Calls Fix

## Problem Identified
iPhone Chrome login and token storage was working, but API calls were failing because:

1. **`isUsingLocalStorageTokens()`** only returned `true` AFTER login when `TOKEN_TYPE` was set
2. **API requests made before/during login** weren't getting `X-Access-Token` headers
3. **Request interceptor** wasn't detecting iPhone Chrome as needing localStorage tokens

## Root Cause
The `isUsingLocalStorageTokens()` function only checked for stored `TOKEN_TYPE = 'localStorage'`, which is only set after successful login. For API calls made during login or before authentication, it returned `false`, causing the interceptor to use cookie-based auth instead of adding the required `X-Access-Token` header.

## Solution Implemented

### 1. Enhanced `isUsingLocalStorageTokens()` Logic
**File**: `src/shared/utils/tokenStorage.js`

```javascript
export const isUsingLocalStorageTokens = () => {
  const tokenType = getStorageItem(TOKEN_KEYS.TOKEN_TYPE);
  
  // If we have stored token type, use that (post-login)
  if (tokenType === 'localStorage') {
    return true;
  }
  
  // If no stored token type, check current platform detection (pre-login)
  // Inline iOS WebKit detection to avoid circular imports
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Check if API is cross-domain
  const currentDomain = window.location.hostname;
  const apiDomain = 'ezeeroom-production.up.railway.app';
  const isCrossDomain = /* domain comparison logic */;
  
  return isIOS && isCrossDomain;
};
```

### 2. Improved API Request Interceptor
**File**: `src/shared/services/Api.jsx`

```javascript
api.interceptors.request.use((config) => {
  const usingLocalStorageTokens = isUsingLocalStorageTokens();
  
  if (usingLocalStorageTokens) {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers['X-Access-Token'] = accessToken;
      console.log('📱 Added X-Access-Token header for iOS WebKit cross-domain auth');
    } else {
      console.log('⚠️ iOS WebKit detected but no access token available');
    }
    config.withCredentials = false;
  } else {
    config.withCredentials = true;
    console.log('🍪 Using cookie-based authentication');
  }
  
  // Enhanced logging for debugging
  console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
    usingTokens: usingLocalStorageTokens,
    hasAccessToken: !!config.headers['X-Access-Token'],
    withCredentials: config.withCredentials
  });
  
  return config;
});
```

### 3. Avoided Circular Import Issues
- **Inline detection** in `tokenStorage.js` instead of importing from `authDetection.js`
- **Hardcoded API domain** to avoid importing from `firebaseConfig.js`
- **Self-contained logic** prevents dependency loops

## How It Works Now

### Before Login (iPhone Chrome):
1. `isUsingLocalStorageTokens()` detects iOS + cross-domain → returns `true`
2. Request interceptor adds `X-Access-Token: null` (no token yet)
3. API calls work with proper headers structure

### During Login (iPhone Chrome):
1. Login endpoint `/auth/firebase-cross-domain` called with proper headers
2. Tokens stored in localStorage with `TOKEN_TYPE = 'localStorage'`
3. Subsequent API calls get `X-Access-Token` with actual token

### After Login (iPhone Chrome):
1. `isUsingLocalStorageTokens()` returns `true` (stored token type)
2. All API calls include `X-Access-Token` header with valid token
3. Data loads successfully

## Expected Console Logs (iPhone Chrome)

### Pre-Login API Calls:
```
⚠️ iOS WebKit detected but no access token available
🌐 API Request: GET /api/hotels/top-highlights {
  usingTokens: true,
  hasAccessToken: false,
  withCredentials: false
}
```

### Post-Login API Calls:
```
📱 Added X-Access-Token header for iOS WebKit cross-domain auth
🌐 API Request: GET /api/hotels/user/123/all {
  usingTokens: true,
  hasAccessToken: true,
  withCredentials: false
}
```

## Testing Results Expected

### iPhone Chrome:
- ✅ **Login works** (already confirmed)
- ✅ **Token storage works** (already confirmed)
- ✅ **API calls now work** (should be fixed)
- ✅ **Data loads properly** (should be fixed)

### Other Platforms:
- ✅ **Desktop Chrome** - unchanged, uses cookies
- ✅ **iPhone Safari** - unchanged, uses localStorage tokens
- ✅ **Android** - unchanged, uses cookies

## Key Improvements

1. **Platform Detection Before Login** - Detects iPhone Chrome even without stored tokens
2. **Enhanced Logging** - Better debugging info for API requests
3. **Circular Import Prevention** - Self-contained logic avoids dependency issues
4. **Consistent Behavior** - Same localStorage approach for all iOS browsers

The fix ensures that iPhone Chrome (and all iOS browsers) properly use localStorage tokens for API authentication from the very first request, not just after login.
