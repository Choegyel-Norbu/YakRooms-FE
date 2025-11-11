# 🔒 Environment Variables Security Fix

## ⚠️ CRITICAL SECURITY ISSUE RESOLVED

**Issue:** UploadThing secret key was exposed in client-side JavaScript  
**Status:** ✅ Fixed in frontend code  
**Action Required:** Follow steps below to complete the fix

---

## 📋 Required Actions

### ✅ 1. Frontend Code (COMPLETED)
- Removed direct UploadThing API calls from client
- Now proxies all uploads through backend for security

### 🔄 2. Update Local Environment Variables

Create or update your `.env` file:

```bash
# ======================================
# YakRooms Frontend Environment Variables
# ======================================

# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=10000

# UploadThing Configuration
# ⚠️ ONLY expose the public App ID
VITE_UPLOADTHING_APP_ID=<your_app_id_from_vercel>

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# WebSocket
VITE_WEBSOCKET_URL=ws://localhost:8080/ws
```

**🚨 CRITICAL:** Do NOT add `VITE_UPLOADTHING_SECRET` to your `.env` file!

---

### 🔄 3. Update Vercel Environment Variables

Go to: https://vercel.com/your-project/settings/environment-variables

#### ❌ DELETE These Variables:
- `VITE_UPLOADTHING_SECRET` (Preview)
- `VITE_UPLOADTHING_SECRET` (Production)

#### ✅ KEEP These Variables:
- `VITE_UPLOADTHING_APP_ID` (Safe to expose to client)

---

### 🔄 4. Rotate the Exposed Key

**⚠️ URGENT:** The key `sk_live_014685ca4761bc35d3a0187cea8e27e3` is compromised!

1. Go to [UploadThing Dashboard](https://uploadthing.com/dashboard)
2. Navigate to **API Keys** section
3. **Delete/Revoke** the exposed key: `sk_live_014685ca4761bc35d3a0187cea8e27e3`
4. **Generate a NEW secret key**
5. Add the NEW key to your **backend** environment variables (NOT frontend!)

---

### 🔄 5. Update Backend (Required)

Your backend needs to handle UploadThing uploads. Add this endpoint:

#### Backend Environment Variable:
```bash
UPLOADTHING_SECRET=sk_live_<NEW_KEY_HERE>
UPLOADTHING_APP_ID=<your_app_id>
```

#### Required Backend Endpoint:

**Endpoint:** `POST /v1/uploadthing/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: The file to upload
  - `field`: Field identifier (e.g., "photos", "license")
  - `fileType`: Either "image" or "pdf"

**Response:**
```json
{
  "url": "https://utfs.io/f/abc123_filename.jpg",
  "fileKey": "abc123_filename.jpg",
  "field": "photos"
}
```

#### Example Backend Implementation (Spring Boot):

```java
@RestController
@RequestMapping("/v1/uploadthing")
public class UploadThingController {

    @Value("${uploadthing.secret}")
    private String uploadthingSecret;

    @Value("${uploadthing.app-id}")
    private String uploadthingAppId;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("field") String field,
            @RequestParam("fileType") String fileType) {
        
        try {
            // Validate file type
            if (!fileType.equals("image") && !fileType.equals("pdf")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid file type"));
            }

            // Call UploadThing API with secret key
            // (Implementation depends on your HTTP client)
            String uploadUrl = callUploadThingAPI(file, field, fileType);

            return ResponseEntity.ok(Map.of(
                "url", uploadUrl,
                "fileKey", extractFileKey(uploadUrl),
                "field", field
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    private String callUploadThingAPI(MultipartFile file, String field, String fileType) {
        // Implement UploadThing API call here
        // Use uploadthingSecret in headers
        // Return the uploaded file URL
    }
}
```

---

## 🧪 Testing

After implementing:

1. **Test local upload:**
   ```bash
   npm run dev
   # Try uploading a file in your app
   ```

2. **Verify no secrets in bundle:**
   ```bash
   npm run build
   grep -r "sk_live" dist/
   # Should return NO results
   ```

3. **Deploy and test production:**
   ```bash
   npm run build
   # Deploy to Vercel
   # Test file uploads
   ```

---

## ✅ Security Checklist

- [ ] Frontend code updated (proxies through backend)
- [ ] Removed `VITE_UPLOADTHING_SECRET` from local `.env`
- [ ] Deleted `VITE_UPLOADTHING_SECRET` from Vercel
- [ ] Rotated the exposed key in UploadThing dashboard
- [ ] Added new secret to **backend** environment
- [ ] Implemented backend upload endpoint
- [ ] Tested uploads locally
- [ ] Verified no secrets in built bundle
- [ ] Tested uploads in production

---

## 📚 Why This Fix Matters

### Before (Vulnerable):
```javascript
// ❌ Secret exposed to browser
const secret = import.meta.env.VITE_UPLOADTHING_SECRET;
fetch("https://uploadthing.com/api/...", {
  headers: { "X-Uploadthing-Api-Key": secret }
});
```

### After (Secure):
```javascript
// ✅ Secret stays on server
await api.post("/v1/uploadthing/upload", formData);
// Backend handles the secret securely
```

---

## 🆘 Need Help?

If you encounter issues:

1. Check backend logs for upload errors
2. Verify backend endpoint is accessible
3. Ensure new UploadThing key is valid
4. Check CORS settings if upload fails

---

## 📞 Contact

For questions about this security fix, refer to the implementation in:
- Frontend: `src/shared/services/uploadService.jsx`
- Backend: Your backend controller (needs implementation)

