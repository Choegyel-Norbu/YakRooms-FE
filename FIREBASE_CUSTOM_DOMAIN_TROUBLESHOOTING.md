# Firebase Custom Domain Troubleshooting Checklist

## Issue: `ezeeroom.bt` not working, but `yakrooms.firebaseapp.com` works

### ✅ Step 1: Verify Firebase Authorized Domains
**Location:** Firebase Console → Authentication → Settings → Authorized domains

**Required domains:**
- [ ] `ezeeroom.bt` (already added based on earlier screenshot)
- [ ] `www.ezeeroom.bt` (already added based on earlier screenshot)
- [ ] `yakrooms.firebaseapp.com` (keep for fallback)

**How to check:**
1. Go to: https://console.firebase.google.com/project/yakrooms/authentication/settings
2. Scroll to "Authorized domains"
3. Verify both `ezeeroom.bt` and `www.ezeeroom.bt` are listed

---

### ✅ Step 2: Configure OAuth 2.0 Client Redirect URIs
**Location:** Google Cloud Console → APIs & Services → Credentials

**Critical:** This is the most common issue!

**Steps:**
1. Go to: https://console.cloud.google.com/apis/credentials?project=yakrooms
2. Find your **OAuth 2.0 Client ID** (usually named "Web client (auto created by Google Service)")
3. Click to edit it
4. In **"Authorized redirect URIs"**, ensure these are added:
   ```
   https://ezeeroom.bt/__/auth/handler
   https://www.ezeeroom.bt/__/auth/handler
   ```
5. Keep existing URIs:
   ```
   https://yakrooms.firebaseapp.com/__/auth/handler
   https://yakrooms.web.app/__/auth/handler
   ```
6. **Save** the changes

**⏱️ Propagation Time:**
   - **Typical:** 5-15 minutes
   - **Maximum:** Up to 30 minutes in rare cases
   - **Why:** Google's OAuth servers need to refresh their configuration cache
   
   **How to verify it's working:**
   - Try the sign-in after waiting at least 5 minutes
   - If still not working after 30 minutes, double-check the URIs are saved correctly
   - Clear browser cache or use incognito mode when testing

---

### ✅ Step 3: Verify OAuth Consent Screen Authorized Domains
**Location:** Google Cloud Console → APIs & Services → OAuth consent screen → Branding

**Steps:**
1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=yakrooms
2. Click on **"Branding"** in the left sidebar
3. In **"Authorised domains"** section, verify:
   - [ ] `ezeeroom.bt` is listed
   - [ ] `www.ezeeroom.bt` (optional but recommended)

---

### ✅ Step 4: Update Firebase Config in Code
**File:** `src/shared/services/firebaseConfig.js`

**Change:**
```javascript
authDomain: "ezeeroom.bt",  // Change from "yakrooms.firebaseapp.com"
```

**Note:** Only change this AFTER completing Steps 1-3 above!

---

### ✅ Step 5: Verify Domain DNS and SSL
**Check:**
- [ ] `ezeeroom.bt` resolves to your hosting
- [ ] SSL certificate is valid for `ezeeroom.bt`
- [ ] Site loads correctly at `https://ezeeroom.bt`

**Test:**
```bash
# Check DNS
dig ezeeroom.bt

# Check SSL
curl -I https://ezeeroom.bt
```

---

### ✅ Step 6: Check Browser Console Errors
**When testing login:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to sign in
4. Look for specific error codes:
   - `auth/unauthorized-domain` → Domain not in Firebase authorized domains
   - `auth/redirect-uri-mismatch` → Redirect URI not in OAuth Client settings
   - `auth/popup-blocked` → Browser blocking popup
   - `auth/popup-closed-by-user` → User closed popup (not an error)

---

### ✅ Step 7: Verify Firebase Hosting (if applicable)
**If using Firebase Hosting:**
- [ ] Custom domain is connected in Firebase Hosting settings
- [ ] SSL certificate is provisioned
- [ ] Domain status shows "Connected"

**Location:** Firebase Console → Hosting → Custom domains

---

### 🔍 Debugging Tips

1. **Test with browser network tab:**
   - Open Network tab in DevTools
   - Look for requests to `__/auth/handler`
   - Check if they're returning errors (4xx, 5xx)

2. **Check actual redirect URL:**
   - When popup opens, check the URL
   - It should contain your domain
   - Look for redirect_uri parameter in the URL

3. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or use incognito/private window

4. **Wait for propagation:**
   - OAuth redirect URI changes: **5-15 minutes** (up to 30 minutes max)
   - Firebase authorized domains: **Usually immediate, but allow 5 minutes**
   - OAuth consent screen domains: **5-10 minutes**
   - **Always wait at least 5 minutes before testing changes**

---

## Quick Test After Configuration

Once all steps are complete:
1. Update `authDomain` in code to `"ezeeroom.bt"` (already done)
2. Add missing `www` redirect URI to OAuth Client (see below)
3. Deploy updated `vercel.json` to production
4. Wait 5-15 minutes for OAuth changes to propagate
5. Test sign-in at `https://www.ezeeroom.bt`
6. Check that Google OAuth popup shows "to continue to ezeeroom.bt"

---

## 🚨 CRITICAL FIX FOR VERCEL HOSTING

**Issue:** When hosting on Vercel (not Firebase Hosting), the `/__/auth/handler` endpoint doesn't exist. Additionally, domain redirects can break OAuth.

**Solution:**
1. **Updated `vercel.json`** to exclude `/__/auth/handler` from domain redirects
2. **Add missing redirect URI:** Your OAuth Client only has `https://ezeeroom.bt/__/auth/handler` but you need BOTH:
   - `https://ezeeroom.bt/__/auth/handler` ✅ (already added)
   - `https://www.ezeeroom.bt/__/auth/handler` ❌ (MISSING - add this!)

**Steps to add missing redirect URI:**
1. Go to: https://console.cloud.google.com/apis/credentials?project=yakrooms
2. Find your OAuth 2.0 Client ID
3. Click to edit
4. In "Authorized redirect URIs", click "+ Add URI"
5. Add: `https://www.ezeeroom.bt/__/auth/handler`
6. Save and wait 5-15 minutes

**Note:** Since you're using Vercel and redirect `ezeeroom.bt` → `www.ezeeroom.bt`, make sure to test login on `www.ezeeroom.bt` (the final destination).

---

## Common Issues & Solutions

### Issue: "unauthorized-domain" error
**Solution:** Add domain to Firebase Console → Authentication → Settings → Authorized domains

### Issue: "redirect-uri-mismatch" error  
**Solution:** Add redirect URIs to Google Cloud Console → Credentials → OAuth 2.0 Client ID

### Issue: Popup blocked or closed immediately
**Solution:** 
- Check browser popup blocker settings
- Ensure redirect URIs are correctly configured
- Verify domain is accessible and has valid SSL

### Issue: Works on localhost but not production
**Solution:**
- Verify production domain is in all authorized lists
- Check that code is deployed with correct `authDomain`
- Ensure SSL certificate is valid

