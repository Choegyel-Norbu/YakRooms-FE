# 🔧 Fix: Vercel Token Permission Error

**Error:** "Git author mac@Chogyal.local must have access to the team choegyel-norbu's projects on Vercel to create deployments."

**Cause:** The Vercel token doesn't have access to the team, or it was created from a different account.

---

## 🎯 Solution: Create Token from Correct Account

### Step 1: Verify Your Vercel Account

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Check which account you're logged into
   - Make sure it's the account that has access to "choegyel-norbu's projects" team

2. **Check Team Access:**
   - Go to: https://vercel.com/teams
   - Verify you can see "choegyel-norbu's projects" team
   - If you can't see it, you need to be added to the team

---

### Step 2: Create New Token from Correct Account

1. **Make sure you're logged into the correct Vercel account:**
   - The one that has access to "choegyel-norbu's projects"

2. **Create a new token:**
   - Go to: https://vercel.com/account/tokens
   - Click **"Create Token"**
   - Name it: `github-actions-deploy-team`
   - Expiration: Choose "No expiration" or a long date
   - **IMPORTANT:** Make sure you're creating it from the account that has team access
   - Click **"Create"**
   - **COPY THE TOKEN** (you won't see it again!)

---

### Step 3: Update GitHub Secret

1. **Go to GitHub Secrets:**
   - https://github.com/Choegyel-Norbu/YakRooms-FE/settings/secrets/actions

2. **Update VERCEL_TOKEN:**
   - Find `VERCEL_TOKEN` in the list
   - Click **"Update"**
   - Paste the new token
   - Click **"Update secret"**

---

### Step 4: Verify Team Access

If you're not sure about team access:

1. **Check Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Look at the top left - what account/team is selected?
   - Should show: "choegyel-norbu's projects"

2. **If you can't see the team:**
   - You might need to be added to the team
   - Or switch to the correct account
   - Or the team might be under a different name

---

## 🔍 Alternative: Check Current Token

If you want to verify which account the current token belongs to:

1. **Test the token locally:**
   ```bash
   # Set token temporarily
   export VERCEL_TOKEN="your-current-token"
   
   # Try to list projects
   vercel projects ls --token=$VERCEL_TOKEN
   ```

2. **Check what it shows:**
   - Does it show "choegyel-norbu's projects"?
   - Or does it show a different account/team?

---

## 🛠️ If You Don't Have Team Access

If you don't have access to the team, you have two options:

### Option 1: Get Added to Team
- Ask the team owner to add you
- Then create a new token from your account

### Option 2: Use Team Owner's Token
- Ask the team owner to create a token
- Use that token in GitHub secrets
- **Note:** This gives the token full access, so be careful

---

## ✅ Quick Fix Steps

1. **Log into Vercel with the account that has team access**
2. **Go to:** https://vercel.com/account/tokens
3. **Create a new token**
4. **Update `VERCEL_TOKEN` secret in GitHub:**
   - https://github.com/Choegyel-Norbu/YakRooms-FE/settings/secrets/actions
5. **Test the deployment again**

---

## 🎯 Most Important

**The token MUST be created from the Vercel account that has access to "choegyel-norbu's projects" team.**

If you're logged into a personal account that doesn't have team access, the token won't work.

---

**After updating the token, push a new commit to trigger the workflow again!** 🚀





