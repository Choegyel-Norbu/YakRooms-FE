# 🔧 Fix: GitHub Actions Workflow Failing

**Status:** Workflow is running but failing ❌

**The workflow file looks correct, so the issue is likely:**
1. Missing or incorrect GitHub secrets
2. Vercel CLI command errors
3. Build/deployment errors

---

## 🔍 Step 1: Check the Error Logs

1. **Go to the failed workflow run:**
   - Click on the failed workflow (red X)
   - Or go to: https://github.com/Choegyel-Norbu/YakRooms-FE/actions

2. **Click on the failed job:**
   - Click on "deploy" job (should be red)

3. **Check which step failed:**
   - Look through the steps
   - Find the one with ❌ (red X)
   - Common failing steps:
     - "Pull Vercel Environment Information"
     - "Build Project Artifacts"
     - "Deploy Project Artifacts to Vercel"

4. **Read the error message:**
   - Expand the failed step
   - Copy the error message
   - Common errors listed below

---

## 🛠️ Common Errors and Fixes

### Error 1: "Token is invalid" or "Authentication failed"

**Cause:** `VERCEL_TOKEN` secret is missing or incorrect

**Fix:**
1. Go to: https://vercel.com/account/tokens
2. Create a new token
3. Go to: https://github.com/Choegyel-Norbu/YakRooms-FE/settings/secrets/actions
4. Update `VERCEL_TOKEN` secret with the new token

---

### Error 2: "Organization ID not found" or "Invalid organization"

**Cause:** `VERCEL_ORG_ID` is wrong

**Fix:**
1. Verify the ID is: `team_JzlZFsN1ZkYrUV1eAtx4PCz4`
2. Go to: https://github.com/Choegyel-Norbu/YakRooms-FE/settings/secrets/actions
3. Update `VERCEL_ORG_ID` secret
4. Make sure there are NO extra spaces

---

### Error 3: "Project ID not found" or "Invalid project"

**Cause:** `VERCEL_PROJECT_ID` is wrong

**Fix:**
1. Verify the ID is: `prj_uOplhRq79qEYuviR5jlThv74j78I`
2. Go to: https://github.com/Choegyel-Norbu/YakRooms-FE/settings/secrets/actions
3. Update `VERCEL_PROJECT_ID` secret
4. Make sure there are NO extra spaces

---

### Error 4: "Build failed" or npm errors

**Cause:** Build process is failing

**Fix:**
1. Check the build logs for specific errors
2. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Environment variables missing
3. Test build locally:
   ```bash
   npm ci
   npm run build
   ```

---

### Error 5: "vercel pull" or "vercel build" command failed

**Cause:** Vercel CLI issues or missing configuration

**Fix:**
1. The workflow might need `.vercel` folder
2. Or we need to adjust the workflow
3. See "Improved Workflow" section below

---

## 🔧 Improved Workflow (If Current One Fails)

If the current workflow keeps failing, here's an improved version:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Key changes:**
- Added `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` to all steps that need them
- This ensures Vercel CLI knows which project to work with

---

## ✅ Quick Fix Steps

1. **Check the error in GitHub Actions:**
   - Go to: https://github.com/Choegyel-Norbu/YakRooms-FE/actions
   - Click on the failed run
   - Find the error message

2. **Verify secrets are set:**
   - Go to: https://github.com/Choegyel-Norbu/YakRooms-FE/settings/secrets/actions
   - Ensure all three secrets exist:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID` = `team_JzlZFsN1ZkYrUV1eAtx4PCz4`
     - `VERCEL_PROJECT_ID` = `prj_uOplhRq79qEYuviR5jlThv74j78I`

3. **If secrets are missing or wrong:**
   - Add/update them
   - Make sure values are exact (no spaces)

4. **Test again:**
   ```bash
   git commit --allow-empty -m "test: retry deployment"
   git push origin main
   ```

---

## 🎯 Most Likely Issue

**90% chance it's one of these:**
1. Secrets not set in GitHub
2. `VERCEL_TOKEN` is invalid or expired
3. `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID` have typos

**Check the error message first - it will tell you exactly what's wrong!**

---

**Please share the error message from the failed workflow run, and I can help you fix it specifically!** 🔍

