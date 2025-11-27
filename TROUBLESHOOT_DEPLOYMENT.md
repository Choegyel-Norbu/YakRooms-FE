# 🔍 Troubleshooting: GitHub Actions Not Deploying to Vercel

**Issue:** Pushed changes but deployment isn't happening in Vercel.

---

## 🔍 Step 1: Check GitHub Actions Status

1. **Go to GitHub Actions:**
   - Open: https://github.com/Choegyel-Norbu/YakRooms-FE/actions

2. **Check for Workflow Runs:**
   - Do you see any workflow runs?
   - If yes, click on the latest run
   - Check if it's:
     - ✅ Green (successful)
     - ❌ Red (failed)
     - 🟡 Yellow (in progress)

3. **If No Workflow Runs:**
   - The workflow might not be triggering
   - Check if the file is in the correct location: `.github/workflows/deploy-vercel.yml`

---

## 🔍 Step 2: Check for Errors

If the workflow ran but failed:

1. **Click on the failed workflow run**
2. **Check the error message:**
   - Common errors:
     - "Token is invalid" → Secrets not set correctly
     - "Organization ID not found" → Wrong ORG_ID
     - "Project ID not found" → Wrong PROJECT_ID
     - "Permission denied" → Token doesn't have access

---

## 🔍 Step 3: Verify GitHub Secrets Are Set

**This is the most common issue!**

1. **Go to Secrets:**
   - https://github.com/Choegyel-Norbu/YakRooms-FE/settings/secrets/actions

2. **Verify all three secrets exist:**
   - ✅ `VERCEL_TOKEN`
   - ✅ `VERCEL_ORG_ID`
   - ✅ `VERCEL_PROJECT_ID`

3. **If any are missing:**
   - Add them now
   - Use the values from earlier:
     - `VERCEL_ORG_ID`: `team_JzlZFsN1ZkYrUV1eAtx4PCz4`
     - `VERCEL_PROJECT_ID`: `prj_uOplhRq79qEYuviR5jlThv74j78I`
     - `VERCEL_TOKEN`: Get from https://vercel.com/account/tokens

---

## 🔍 Step 4: Check Workflow File Location

Verify the workflow file exists:

1. **Check file location:**
   ```bash
   ls -la .github/workflows/deploy-vercel.yml
   ```

2. **Verify it's committed:**
   ```bash
   git ls-files .github/workflows/deploy-vercel.yml
   ```

3. **If missing, add it:**
   ```bash
   git add .github/workflows/deploy-vercel.yml
   git commit -m "fix: add deployment workflow"
   git push origin main
   ```

---

## 🔍 Step 5: Test the Workflow Manually

1. **Make a small change:**
   ```bash
   echo "// test" >> src/App.jsx
   git add src/App.jsx
   git commit -m "test: trigger deployment"
   git push origin main
   ```

2. **Watch GitHub Actions:**
   - Go to: https://github.com/Choegyel-Norbu/YakRooms-FE/actions
   - You should see a new workflow run starting

---

## 🛠️ Common Issues and Fixes

### Issue 1: "Token is invalid"

**Fix:**
1. Go to: https://vercel.com/account/tokens
2. Create a new token
3. Update `VERCEL_TOKEN` secret in GitHub

### Issue 2: "Organization ID not found"

**Fix:**
1. Verify `VERCEL_ORG_ID` is: `team_JzlZFsN1ZkYrUV1eAtx4PCz4`
2. Make sure there are no extra spaces
3. Check it's exactly: `team_JzlZFsN1ZkYrUV1eAtx4PCz4`

### Issue 3: "Project ID not found"

**Fix:**
1. Verify `VERCEL_PROJECT_ID` is: `prj_uOplhRq79qEYuviR5jlThv74j78I`
2. Make sure there are no extra spaces
3. Check it's exactly: `prj_uOplhRq79qEYuviR5jlThv74j78I`

### Issue 4: Workflow not triggering

**Fix:**
1. Check branch name is `main` (not `master`)
2. Verify workflow file is in: `.github/workflows/deploy-vercel.yml`
3. Check file is committed and pushed

### Issue 5: "Permission denied"

**Fix:**
1. Check Vercel token has correct permissions
2. Create a new token with full access
3. Update the secret

---

## ✅ Quick Checklist

- [ ] GitHub Actions workflow file exists: `.github/workflows/deploy-vercel.yml`
- [ ] File is committed and pushed to GitHub
- [ ] All three secrets are added in GitHub
- [ ] Secrets have correct values (no typos, no extra spaces)
- [ ] Vercel token is valid and not expired
- [ ] Branch name is `main` (matches workflow trigger)
- [ ] Workflow is visible in GitHub Actions tab

---

## 🚀 Quick Fix Commands

If you need to re-add the workflow:

```bash
# Verify workflow file exists
cat .github/workflows/deploy-vercel.yml

# If missing, it should be there from our earlier commit
# Check git status
git status

# If workflow file is missing, check if it was committed
git log --all --full-history -- .github/workflows/deploy-vercel.yml
```

---

## 📊 Expected Behavior

When everything is set up correctly:

1. **You push to `main`:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions triggers:**
   - Within 10-30 seconds, workflow starts
   - You can see it in: https://github.com/Choegyel-Norbu/YakRooms-FE/actions

3. **Workflow runs:**
   - Checks out code
   - Installs dependencies
   - Builds project
   - Deploys to Vercel

4. **Vercel receives deployment:**
   - New deployment appears in Vercel dashboard
   - Site updates automatically

---

## 🆘 Still Not Working?

1. **Check GitHub Actions logs:**
   - Go to: https://github.com/Choegyel-Norbu/YakRooms-FE/actions
   - Click on the latest run
   - Read the error messages

2. **Share the error:**
   - Copy the error message
   - Check which step failed

3. **Verify secrets again:**
   - Double-check all three secrets
   - Make sure values are correct
   - No extra spaces or newlines

---

**Most likely issue: GitHub secrets are not set or have incorrect values!** 🎯








