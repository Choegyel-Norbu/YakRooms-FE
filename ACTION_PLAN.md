# 🎯 Security Fix Action Plan

**Status:** ✅ Code Fixed | ⚠️ Keys Need Rotation  
**Priority:** 🔴 URGENT - Complete within 24 hours  
**Estimated Time:** 3 hours total

---

## 🚨 STEP 1: Rotate Stripe Key (15 min) - DO FIRST!

### Why This Is Urgent:
The key `sk_live_...786eb8f` was exposed in your JavaScript bundle and **must be rotated immediately** to prevent:
- Unauthorized charges
- Fraudulent refunds
- Customer data access
- PCI-DSS violations

### Instructions:

1. **Open Stripe Dashboard:**
   ```
   https://dashboard.stripe.com/apikeys
   ```

2. **Find the Exposed Key:**
   - Look in "Secret keys" section
   - Find key ending in `...786eb8f`
   - Or: Click "Reveal live key" to see full key

3. **Roll/Delete the Key:**
   - Click "⋮" (three dots) next to the key
   - Select "Roll key" or "Delete"
   - Confirm deletion
   - ✅ Key is now revoked!

4. **Generate New Key:**
   - Click "Create secret key"
   - Name it: "Production API Key"
   - Copy the key (shown only once!)
   - Save to password manager

5. **Update Your Backend:**
   ```properties
   # Backend environment (e.g., application.properties)
   stripe.secret.key=sk_live_[YOUR_NEW_KEY_HERE]
   ```

6. **Restart Backend & Test:**
   ```bash
   # Restart your backend service
   # Then test a payment transaction
   ```

✅ **Checkpoint:** Stripe key rotated and tested

---

## 🔴 STEP 2: Rotate UploadThing Key (10 min)

1. **Open UploadThing Dashboard:**
   ```
   https://uploadthing.com/dashboard
   ```

2. **Navigate to API Keys**

3. **Delete Exposed Key:**
   - Find: `sk_live_014685ca4761bc35d3a0187cea8e27e3`
   - Click "Delete" or "Revoke"
   - Confirm

4. **Generate New Key:**
   - Click "Generate New Secret Key"
   - Copy the key
   - Save to password manager

5. **Update Backend:**
   ```properties
   uploadthing.secret=sk_live_[YOUR_NEW_KEY_HERE]
   uploadthing.app.id=[YOUR_APP_ID]
   ```

✅ **Checkpoint:** UploadThing key rotated

---

## 🟡 STEP 3: Update Vercel Environment (5 min)

1. **Go to Vercel:**
   ```
   https://vercel.com/[your-project]/settings/environment-variables
   ```

2. **Delete These Variables from ALL Environments:**
   - ❌ `VITE_UPLOADTHING_SECRET` (Preview)
   - ❌ `VITE_UPLOADTHING_SECRET` (Production)

3. **Verify These Exist (keep them):**
   - ✅ `VITE_UPLOADTHING_APP_ID`
   - ✅ `VITE_STRIPE_PUBLISHABLE_KEY` (if using Stripe on frontend)
   - ✅ `VITE_API_BASE_URL`

4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

✅ **Checkpoint:** Vercel environment cleaned

---

## 🟡 STEP 4: Implement Backend Upload Endpoint (1-2 hours)

### Create: `/v1/uploadthing/upload` (POST)

#### Request:
- Content-Type: `multipart/form-data`
- Body:
  - `file`: The file (image or PDF)
  - `field`: Field identifier ("photos", "license")
  - `fileType`: "image" or "pdf"

#### Response:
```json
{
  "url": "https://utfs.io/f/abc123_file.jpg",
  "fileKey": "abc123_file.jpg",
  "field": "photos"
}
```

#### Example Implementation (Spring Boot):

```java
@RestController
@RequestMapping("/v1/uploadthing")
public class UploadThingController {

    @Value("${uploadthing.secret}")
    private String uploadthingSecret;

    @Value("${uploadthing.app.id}")
    private String uploadthingAppId;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("field") String field,
            @RequestParam("fileType") String fileType) {
        
        try {
            // Step 1: Validate
            if (!fileType.equals("image") && !fileType.equals("pdf")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid file type"));
            }

            // Step 2: Prepare upload with UploadThing API
            String prepareUrl = "https://uploadthing.com/api/prepareUpload";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Uploadthing-Api-Key", uploadthingSecret);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> prepareRequest = Map.of(
                "files", List.of(Map.of(
                    "name", file.getOriginalFilename(),
                    "size", file.getSize(),
                    "type", file.getContentType()
                )),
                "callbackUrl", "https://yak-rooms-fe.vercel.app/api/uploadthing",
                "callbackSlug", field.equals("photos") ? "listingPhotos" : "verificationDocs",
                "routeConfig", Map.of(
                    fileType, Map.of(
                        "maxFileSize", "4MB",
                        "maxFileCount", 1
                    )
                )
            );

            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<Map<String, Object>> entity = 
                new HttpEntity<>(prepareRequest, headers);
            
            ResponseEntity<Map[]> prepareResponse = restTemplate.postForEntity(
                prepareUrl, entity, Map[].class
            );

            Map<String, Object> fileData = prepareResponse.getBody()[0];
            String uploadUrl = (String) fileData.get("url");
            String fileUrl = (String) fileData.get("fileUrl");
            Map<String, String> fields = 
                (Map<String, String>) fileData.get("fields");

            // Step 3: Upload file to S3
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            fields.forEach(builder::part);
            builder.part("file", file.getResource());

            WebClient.create(uploadUrl)
                .post()
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .bodyValue(builder.build())
                .retrieve()
                .toBodilessEntity()
                .block();

            // Step 4: Return success
            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "fileKey", extractFileKey(fileUrl),
                "field", field
            ));
            
        } catch (Exception e) {
            log.error("Upload failed", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    private String extractFileKey(String url) {
        String[] parts = url.split("/f/");
        return parts.length > 1 ? parts[1] : url;
    }
}
```

✅ **Checkpoint:** Backend endpoint implemented

---

## 🟢 STEP 5: Test Locally (30 min)

### 1. Start Backend:
```bash
# Ensure backend is running with new keys
# Check logs for successful startup
```

### 2. Start Frontend:
```bash
cd /path/to/YakRooms-FE
npm run dev
```

### 3. Test File Upload:
- Navigate to a page with file upload
- Select an image or PDF
- Click upload
- Verify:
  - ✅ Request goes to `/v1/uploadthing/upload`
  - ✅ File uploads successfully
  - ✅ URL is returned
  - ✅ File is accessible

### 4. Test Payment (if using Stripe):
- Navigate to payment page
- Enter test card: `4242 4242 4242 4242`
- Complete payment
- Verify:
  - ✅ Payment processes
  - ✅ Shows in Stripe dashboard
  - ✅ Webhooks fire correctly

✅ **Checkpoint:** Local testing passed

---

## 🟢 STEP 6: Build & Verify (10 min)

```bash
cd /path/to/YakRooms-FE

# Clean build
npm run build

# Verify no secrets
npm run verify-secrets
```

### Expected Output:
```
╔═══════════════════════════════════════════════╗
║     Security Verification - Build Check      ║
╚═══════════════════════════════════════════════╝

Scanning: /path/to/dist

Files scanned: 150

✅ PASSED: No secrets found in build!

Your bundle is clean and safe to deploy.
```

✅ **Checkpoint:** Build is clean

---

## 🟢 STEP 7: Deploy (10 min)

```bash
# Commit all changes
git add .
git commit -m "Security fix: Remove exposed API keys and implement backend proxy"

# Push to repository
git push origin main

# Vercel will auto-deploy
# Monitor deployment at: https://vercel.com/dashboard
```

✅ **Checkpoint:** Deployed to production

---

## 🟢 STEP 8: Production Testing (15 min)

### 1. Test File Upload in Production:
- Go to: https://yak-rooms-fe.vercel.app
- Upload a file
- Verify it works

### 2. Test Payment in Production:
- Process a test payment
- Check Stripe dashboard
- Verify webhooks

### 3. Monitor:
- Check Vercel logs
- Check backend logs
- Watch for errors

✅ **Checkpoint:** Production verified

---

## 📋 Final Checklist

### Code:
- [x] UploadThing secret removed from frontend
- [x] Old build artifacts deleted
- [x] Security scanner enhanced
- [x] Payment flow already secure

### Keys:
- [ ] Stripe key rotated
- [ ] UploadThing key rotated
- [ ] New keys in backend environment
- [ ] Old keys revoked

### Environment:
- [ ] Vercel variables cleaned
- [ ] Backend environment updated
- [ ] Production redeployed

### Testing:
- [ ] Local file upload works
- [ ] Local payment works
- [ ] Build verification passes
- [ ] Production file upload works
- [ ] Production payment works

---

## 🆘 Troubleshooting

### Issue: Upload fails with 401
**Solution:** Check backend has correct `uploadthingSecret`

### Issue: Payment fails with authentication error  
**Solution:** Verify new Stripe key in backend environment

### Issue: Verification script fails
**Solution:** Delete `dist/` folder and rebuild: `rm -rf dist && npm run build`

### Issue: Vercel deployment fails
**Solution:** Check environment variables are set correctly

---

## 📞 Need Help?

**Documentation:**
- Complete Stripe Guide: `STRIPE_SECURITY_FIX.md`
- Complete UploadThing Guide: `SECURITY_FIX_COMPLETE.md`
- Environment Setup: `ENV_SETUP_GUIDE.md`
- Full Summary: `SECURITY_FIX_SUMMARY.md`

**Code Files:**
- Upload Service: `src/shared/services/uploadService.jsx`
- Verification Script: `scripts/verify-no-secrets.js`

---

## ✅ Success Criteria

You'll know you're done when:

1. ✅ Both keys have been rotated
2. ✅ Local testing passes
3. ✅ `npm run verify-secrets` passes
4. ✅ Production file uploads work
5. ✅ Production payments work
6. ✅ No errors in logs

---

## 🎉 After Completion

**You will have:**
- ✅ Secure source code
- ✅ Rotated compromised keys
- ✅ Backend proxy architecture
- ✅ Automated security checks
- ✅ Production-ready deployment

**Estimated completion time:** 3 hours

**Start with Step 1 (Rotate Stripe Key) - it's the most critical!**

