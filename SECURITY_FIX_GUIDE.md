# Security Fix Guide: Exposed API Keys

## Issue Summary
**Risk Level:** HIGH (7.4/10)  
**Issue:** Picatic API key `sk_live_014685ca4761bc35d3a0187cea8e27e3` detected in security scan  
**Status:** Key not found in current source code ✅  
**Required Actions:** Verification and preventive measures

---

## Immediate Actions Required

### 1. Verify Key Removal ✅ (COMPLETED)
- [x] Searched entire source code - **No key found**
- [ ] Check dist/build folders for compiled versions
- [ ] Verify git history doesn't contain the key
- [ ] Confirm key is not in any `.env` files

### 2. Rotate the Exposed Key Immediately

Even if the key is removed from code, it may have been:
- Cached by browsers
- Indexed by search engines
- Captured in logs/monitoring tools
- Downloaded by malicious actors

**Action Steps:**

1. **Log into Picatic Dashboard**
   - Go to: https://www.picatic.com/dashboard
   - Navigate to: Settings → API Keys

2. **Revoke the Exposed Key**
   ```
   Old Key: sk_live_014685ca4761bc35d3a0187cea8e27e3
   Status: REVOKE IMMEDIATELY
   ```

3. **Generate New Key**
   - Create new API key
   - Store securely (see Backend Implementation below)
   - Update backend configuration only

4. **Enable API Key Restrictions**
   - IP Whitelist: Add only your backend server IPs
   - Rate Limits: Set appropriate limits
   - Domain Restrictions: Restrict to your domains
   - Webhook Verification: Enable signature verification

---

## Backend Implementation (Secure Architecture)

### Environment Variables Setup

Create `.env` file on your **backend server** (never commit to git):

```bash
# Payment Gateway Configuration
PICATIC_API_KEY=sk_live_NEW_KEY_HERE
PICATIC_API_SECRET=your_secret_here
PICATIC_WEBHOOK_SECRET=webhook_secret_here

# Environment
NODE_ENV=production
ALLOWED_ORIGINS=https://www.ezeeroom.bt,https://yakrooms.vercel.app
```

### Backend API Endpoint Example

```java
// PaymentController.java (Spring Boot Example)
@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    
    @Value("${picatic.api.key}")
    private String picaticApiKey;  // Loaded from environment
    
    @Value("${picatic.api.secret}")
    private String picaticApiSecret;
    
    @PostMapping("/initiate-picatic")
    public ResponseEntity<?> initiatePicaticPayment(
        @RequestBody PaymentRequest request,
        @AuthenticationPrincipal UserDetails user
    ) {
        try {
            // Validate user authorization
            if (!isAuthorized(user, request)) {
                return ResponseEntity.status(403).build();
            }
            
            // Call Picatic API with server-side key
            PicaticClient client = new PicaticClient(picaticApiKey);
            PaymentResponse response = client.createPayment(
                request.getAmount(),
                request.getCurrency(),
                request.getDescription()
            );
            
            // Return only safe data to frontend
            return ResponseEntity.ok(Map.of(
                "paymentUrl", response.getPaymentUrl(),
                "orderId", response.getOrderId(),
                "expiresAt", response.getExpiresAt()
            ));
            
        } catch (Exception e) {
            log.error("Payment initiation failed", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping("/picatic-webhook")
    public ResponseEntity<?> handlePicaticWebhook(
        @RequestBody String payload,
        @RequestHeader("X-Picatic-Signature") String signature
    ) {
        // Verify webhook signature
        if (!verifyWebhookSignature(payload, signature, picaticApiSecret)) {
            log.warn("Invalid webhook signature");
            return ResponseEntity.status(401).build();
        }
        
        // Process payment status update
        processPaymentUpdate(payload);
        
        return ResponseEntity.ok().build();
    }
}
```

### Backend .gitignore (Ensure these are excluded)

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# API Keys
**/secrets/
**/config/keys.*

# Build artifacts with embedded configs
dist/
build/
```

---

## Frontend Best Practices (Already Implemented ✅)

Your current frontend implementation is **CORRECT**:

```javascript
// ✅ CORRECT - No API keys in frontend
const initiatePayment = async (paymentData) => {
  // Call YOUR backend, which handles the payment gateway
  const response = await enhancedApi.post('/payment/initiate', paymentData);
  
  // Redirect user to payment URL provided by backend
  if (response.data.paymentUrl) {
    window.location.href = response.data.paymentUrl;
  }
};
```

**Key Principles:**
1. Never store API keys in frontend code
2. Never include secrets in environment variables that go to frontend
3. Always proxy payment requests through your backend
4. Only receive redirect URLs/public tokens from backend

---

## Git History Cleanup (If key was ever committed)

If the key was ever committed to git, you need to remove it from history:

```bash
# 1. Scan git history for the key
git log -S "sk_live_014685ca4761bc35d3a0187cea8e27e3" --all

# 2. If found, use BFG Repo-Cleaner or git-filter-repo
# Install BFG: https://rtyley.github.io/bfg-repo-cleaner/

# 3. Create a file with the exposed key
echo "sk_live_014685ca4761bc35d3a0187cea8e27e3" > keys-to-remove.txt

# 4. Clean git history
bfg --replace-text keys-to-remove.txt --no-blob-protection

# 5. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 6. Force push (⚠️ Coordinate with team first!)
git push --force --all
git push --force --tags
```

**⚠️ Warning:** This rewrites git history. Coordinate with your team!

---

## Build Artifacts Check

Check if API keys are in compiled files:

```bash
# Search in dist/build folders
grep -r "sk_live_" dist/
grep -r "picatic" dist/ -i

# If found, ensure dist/ is in .gitignore
echo "dist/" >> .gitignore
echo "build/" >> .gitignore

# Remove from git if tracked
git rm -r --cached dist/
git commit -m "Remove build artifacts from version control"
```

---

## Security Monitoring & Prevention

### 1. Pre-commit Hooks (Prevent Future Exposures)

Install `git-secrets`:

```bash
# Install
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Setup
cd /Users/mac/Documents/Projects/YakRooms/Organized-FE/YakRooms-FE
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'sk_live_[a-zA-Z0-9]{32}'
git secrets --add 'sk_test_[a-zA-Z0-9]{32}'
git secrets --add --allowed 'EXAMPLE_KEY'
```

### 2. GitHub Secret Scanning

Enable on your repository:
1. Go to: Settings → Security & analysis
2. Enable: "Secret scanning"
3. Enable: "Push protection"

### 3. Environment Variable Validation

Add to your backend startup:

```java
@Component
public class ConfigurationValidator implements ApplicationListener<ApplicationReadyEvent> {
    
    @Value("${picatic.api.key:}")
    private String picaticApiKey;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Validate critical secrets are present
        if (picaticApiKey == null || picaticApiKey.isEmpty()) {
            throw new IllegalStateException("PICATIC_API_KEY is not configured!");
        }
        
        // Ensure not using default/example values
        if (picaticApiKey.contains("EXAMPLE") || picaticApiKey.contains("TODO")) {
            throw new IllegalStateException("Invalid PICATIC_API_KEY detected!");
        }
        
        log.info("✅ Payment gateway configuration validated");
    }
}
```

---

## Verification Checklist

- [ ] **Searched source code** - No keys found ✅
- [ ] **Checked dist/build folders** - Verify no keys present
- [ ] **Searched git history** - Ensure key never committed
- [ ] **Revoked exposed Picatic key** - Generate new key
- [ ] **Updated backend environment** - New key stored securely
- [ ] **Tested payment flow** - Verify everything works
- [ ] **Enabled IP whitelisting** - Restrict API key usage
- [ ] **Set up rate limiting** - Protect against abuse
- [ ] **Installed git-secrets** - Prevent future exposures
- [ ] **Enabled GitHub secret scanning** - Automated detection
- [ ] **Documented for team** - Share security practices
- [ ] **Set up monitoring** - Alert on unusual API usage

---

## Additional Security Recommendations

### 1. Firebase API Key (Currently Exposed - But OK)

I noticed your Firebase config in `firebaseConfig.js`:

```javascript
apiKey: "AIzaSyCpztRaIhsRMisykJgEZD_d0HDnIuKxyKw"
```

**This is SAFE** because:
- Firebase API keys are meant to be public (used in client apps)
- Security is enforced by Firebase Security Rules
- Rate limiting is handled by Firebase

**However, ensure:**
- Firebase Security Rules are properly configured
- App Check is enabled (prevent abuse)
- Usage quotas are set

### 2. Current Payment Integration (RMA Gateway)

Your current payment flow is **properly secured**:

```
Frontend → Backend API → RMA Gateway → Redirect URL
```

Keep this pattern for any new payment providers!

### 3. API Endpoint Security

Review your endpoint authorization (already documented in `api-endpoints-authorization.json`):

```json
{
  "path": "/payment/initiate",
  "authorizedRoles": ["HOTEL_ADMIN", "GUEST"],
  "requiresAuth": true,
  "rateLimit": "10 requests/minute"  // Add this!
}
```

---

## Questions to Answer

Before we proceed with any changes, please clarify:

1. **Is Picatic actively used?**
   - If NO: Remove all Picatic code
   - If YES: Implement backend integration

2. **Where was the key detected?**
   - Security scan tool used?
   - Specific file mentioned?
   - When was the scan performed?

3. **Backend architecture?**
   - Is your backend Spring Boot? (I see Java references)
   - Do you have access to backend codebase?
   - Where are backend env variables stored? (Railway, AWS, etc.)

4. **Have you revoked the key yet?**
   - If not, this should be FIRST priority
   - Generate new key and store on backend only

---

## Support & Resources

- **Picatic API Docs:** https://www.picatic.com/api-docs
- **OWASP API Security:** https://owasp.org/www-project-api-security/
- **Git Secrets Tool:** https://github.com/awslabs/git-secrets
- **BFG Repo Cleaner:** https://rtyley.github.io/bfg-repo-cleaner/

---

## Contact & Next Steps

If you need help with any of these steps, I can:
1. Help search git history for the exposed key
2. Write backend integration code for Picatic
3. Set up git-secrets hooks
4. Review your payment flow security
5. Implement additional security measures

**Immediate Priority:** Revoke the exposed Picatic API key if you haven't already!

