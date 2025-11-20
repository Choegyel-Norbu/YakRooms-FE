# 🔐 UploadThing Key Rotation Guide

## ✅ Good News: Frontend Doesn't Need the Key

Your frontend implementation is **secure** - it doesn't use the UploadThing secret key directly. All uploads are proxied through your backend endpoint `/v1/uploadthing/upload`, which keeps the secret key server-side only.

**Frontend Implementation:**
- ✅ Calls backend: `POST /v1/uploadthing/upload`
- ✅ No secret key in frontend code
- ✅ No secret key in environment variables needed

---

## 🚨 Step-by-Step Key Rotation

### Step 1: Rotate Key in UploadThing Dashboard (5 min)

1. **Go to UploadThing Dashboard:**
   ```
   https://uploadthing.com/dashboard
   ```

2. **Navigate to API Keys:**
   - Click on your project
   - Go to "Settings" → "API Keys" or "Keys" section

3. **Revoke the Exposed Key:**
   - Find: `sk_live_014685ca4761bc35d3a0187cea8e27e3`
   - Click "Revoke" or "Delete"
   - ⚠️ **This key is compromised and must be revoked immediately**

4. **Generate New Secret Key:**
   - Click "Create New Key" or "Generate Key"
   - Choose "Secret Key" (not App ID)
   - Copy the new key (starts with `sk_live_...`)
   - ⚠️ **Save it securely - you'll need it for the backend**

5. **Note Your App ID:**
   - Find your App ID (usually visible in the dashboard)
   - This is safe to expose (used for client-side if needed)

---

### Step 2: Update Backend Environment Variables (5 min)

**Update your backend environment variables** (Spring Boot application.properties or .env):

```bash
# Old (REVOKE THIS)
UPLOADTHING_SECRET=sk_live_014685ca4761bc35d3a0187cea8e27e3

# New (USE THIS)
UPLOADTHING_SECRET=sk_live_[YOUR_NEW_KEY_FROM_STEP_1]
UPLOADTHING_APP_ID=[your_app_id]
```

**Where to update:**
- Local development: `.env` or `application.properties`
- Production backend: Railway/Render/Heroku environment variables
- Staging backend: Staging environment variables

**Backend Configuration (Spring Boot example):**
```properties
uploadthing.secret=sk_live_[NEW_KEY]
uploadthing.app.id=[your_app_id]
```

---

### Step 3: Remove Old Key from Vercel (Frontend) (3 min)

Even though the frontend doesn't use it, **remove it from Vercel** to prevent accidental exposure:

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/[your-project]/settings/environment-variables
   ```

2. **Delete from ALL Environments:**
   - ❌ `VITE_UPLOADTHING_SECRET` (Preview)
   - ❌ `VITE_UPLOADTHING_SECRET` (Production)
   - ❌ `VITE_UPLOADTHING_SECRET` (Development)

3. **Verify These Exist (if needed):**
   - ✅ `VITE_UPLOADTHING_APP_ID` (only if your frontend uses it - currently not used)
   - ✅ `VITE_API_BASE_URL` (your backend URL)

4. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy" to ensure old key is removed from build

---

### Step 4: Test the Upload Flow (5 min)

1. **Start your backend** with the new key
2. **Test file upload** from frontend:
   - Upload an image
   - Upload a PDF
   - Verify files appear correctly
3. **Check backend logs** for any UploadThing API errors
4. **Verify** no errors in browser console

---

## ✅ Verification Checklist

- [ ] Old key revoked in UploadThing dashboard
- [ ] New key generated and saved securely
- [ ] Backend environment variable updated with new key
- [ ] Backend restarted/redeployed with new key
- [ ] `VITE_UPLOADTHING_SECRET` removed from Vercel (all environments)
- [ ] Frontend redeployed (to clear any cached builds)
- [ ] Upload functionality tested and working
- [ ] No errors in backend logs
- [ ] No errors in browser console

---

## 🔍 How to Verify No Keys Are Exposed

### Check Frontend Build:
```bash
# Build the project
npm run build

# Search for any secret keys in the build
grep -r "sk_live_" dist/
# Should return: No matches

# Search for UploadThing secret env var
grep -r "VITE_UPLOADTHING_SECRET" dist/
# Should return: No matches
```

### Check Source Code:
```bash
# Search source code for secret keys
grep -r "sk_live_" src/
# Should return: No matches (only in docs/comments is OK)

# Search for UploadThing secret usage
grep -r "VITE_UPLOADTHING_SECRET" src/
# Should return: No matches
```

---

## 📋 Current Architecture

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ POST /v1/uploadthing/upload
       │ (FormData: file, field, fileType)
       ▼
┌─────────────┐
│   Backend   │
│  (Spring)   │
└──────┬──────┘
       │ Uses: UPLOADTHING_SECRET (server-side only)
       │
       ▼
┌─────────────┐
│ UploadThing │
│     API     │
└─────────────┘
```

**Key Points:**
- ✅ Secret key never leaves the backend
- ✅ Frontend only knows about backend endpoint
- ✅ All UploadThing API calls happen server-side

---

## 🆘 Troubleshooting

### Issue: Upload fails after rotation

**Solution:**
1. Verify backend has the new key: Check backend logs for UploadThing API errors
2. Verify backend endpoint is accessible: Test `POST /v1/uploadthing/upload` directly
3. Check UploadThing dashboard: Ensure new key has proper permissions

### Issue: "Invalid API Key" error

**Solution:**
1. Double-check the new key is correct (no extra spaces, full key copied)
2. Ensure backend environment variable is loaded correctly
3. Restart backend after updating environment variables

### Issue: Old key still works

**Solution:**
1. Verify you revoked the old key in UploadThing dashboard
2. Check if you have multiple keys - revoke all old ones
3. Wait a few minutes for revocation to propagate

---

## 📚 Additional Resources

- **UploadThing Dashboard:** https://uploadthing.com/dashboard
- **UploadThing Docs:** https://docs.uploadthing.com
- **Security Fix Documentation:** `SECURITY_FIX_COMPLETE.md`

---

## ⚠️ Important Notes

1. **Never commit secret keys** to git
2. **Never expose secret keys** in frontend code
3. **Rotate keys immediately** if exposed
4. **Monitor UploadThing dashboard** for suspicious activity
5. **Use environment variables** for all secrets (never hardcode)

---

**Last Updated:** After key rotation
**Status:** ✅ Frontend secure, backend key rotation required

