# iOS Safari Cross-Domain Authentication Fix

## Problem
iOS Safari blocks third-party cookies due to Intelligent Tracking Prevention (ITP), causing authentication failures when the API (`ezeeroom-production.up.railway.app`) is on a different domain than the frontend (`yakrooms.com`).

## Solution
Implemented dual authentication flow that automatically detects iOS Safari + cross-domain scenarios and switches to localStorage token-based authentication.

## Implementation Details

### 1. Detection Logic (`src/shared/utils/authDetection.js`)
- **`isIOSSafari()`**: Detects iOS Safari browser
- **`isCrossDomain()`**: Compares frontend and API domains (eTLD+1)
- **`shouldUseCrossDomainAuth()`**: Returns `true` if both conditions are met
- **`getAuthEndpoint()`**: Returns appropriate endpoint (`/auth/firebase-cross-domain` or `/auth/firebase`)

### 2. Token Storage (`src/shared/utils/tokenStorage.js`)
- **`storeTokens()`**: Stores access/refresh tokens with expiry timestamps
- **`getAccessToken()`**: Returns valid access token or `null` if expired
- **`getRefreshToken()`**: Returns valid refresh token or `null` if expired
- **`clearTokens()`**: Clears all stored tokens
- **`updateTokensFromRefresh()`**: Updates tokens after refresh

### 3. Authentication Flow

#### Login Process (`GoogleSignInButton.jsx`)
```javascript
IF (iOS Safari AND cross-domain):
    → POST /auth/firebase-cross-domain
    → Store tokens in localStorage
    → Pass authMethod: 'localStorage' to AuthProvider
ELSE:
    → POST /auth/firebase (existing)
    → Use cookies (existing)
    → Pass authMethod: 'cookie' to AuthProvider
```

#### API Requests (`Api.jsx`)
- **Request Interceptor**: Automatically adds `X-Access-Token` header for localStorage auth
- **Response Interceptor**: Handles token refresh for both auth methods
- **Dual Refresh Logic**: Uses `X-Refresh-Token` header or cookies based on auth method

### 4. Backend Endpoints

#### Login Response: `/auth/firebase-cross-domain`
```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicUrl": "https://...",
    "roles": ["GUEST"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessTokenExpiresIn": 900,
  "refreshTokenExpiresIn": 604800,
  "message": "iPhone Safari cross-domain: Tokens returned in response body",
  "warning": "Store tokens securely in localStorage or sessionStorage"
}
```

#### Token Refresh: `/auth/refresh-token` (existing endpoint)
- **Cookie Auth**: `credentials: 'include'` (existing behavior)
- **Token Auth**: `X-Refresh-Token: <refresh_token>` header
- **Response**: Same format for both methods

### 5. Security Considerations
- Tokens stored in localStorage (less secure than HTTP-only cookies)
- Only used for iOS Safari cross-domain scenarios
- Automatic token expiry checking and refresh
- Proper cleanup on logout/errors

### 6. Logging & Debugging
- Clear console logs indicate which auth method is being used
- 📱 = iOS Safari cross-domain (localStorage tokens)
- 🍪 = Standard cookie-based auth
- 🔄 = Token refresh operations

## Testing
1. **Desktop/Android**: Should continue using cookie-based auth
2. **iOS Safari (cross-domain)**: Should automatically switch to localStorage tokens
3. **iOS Safari (same-domain)**: Should use cookies if domains are aligned

## Future Improvements
1. **Domain Alignment**: Move API to `api.yakrooms.com` to enable first-party cookies
2. **Storage Access API**: For embedded contexts requiring cross-domain cookies
3. **Token Rotation**: Enhanced security with automatic refresh token rotation

## Files Modified
- `src/shared/utils/authDetection.js` (new)
- `src/shared/utils/tokenStorage.js` (new)
- `src/features/authentication/GoogleSignInButton.jsx`
- `src/shared/services/Api.jsx`
- `src/features/authentication/AuthProvider.jsx`

## Backward Compatibility
✅ Existing cookie-based authentication continues to work unchanged
✅ No breaking changes to existing API contracts
✅ Automatic detection means no manual configuration required
