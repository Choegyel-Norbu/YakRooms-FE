# 🗄️ Database Configuration Guide

## 🔧 **Fixed: Local Database Connection**

Your app was connecting to the **production database** instead of your local database. This has been fixed!

### **Files Updated:**

1. **`src/services/Api.jsx`** ✅
   - Now uses: `http://localhost:8080/api`
   - Supports environment variables

2. **`config.js`** ✅
   - Now uses: `http://localhost:8080`
   - Supports environment variables

## 🚀 **How to Switch Between Environments**

### **Option 1: Environment Variables (Recommended)**

Create a `.env.local` file in your project root:

```bash
# For Local Development
VITE_API_BASE_URL=http://localhost:8080/api

# For Production
# VITE_API_BASE_URL=https://yakrooms-be-production.up.railway.app/api

# For Ngrok Testing
# VITE_API_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

### **Option 2: Direct File Editing**

**For Local Development:**
```javascript
// src/services/Api.jsx
baseURL: "http://localhost:8080/api"

// config.js
const API_BASE_URL = "http://localhost:8080";
```

**For Production:**
```javascript
// src/services/Api.jsx
baseURL: "https://yakrooms-be-production.up.railway.app/api"

// config.js
const API_BASE_URL = "https://yakrooms-be-production.up.railway.app";
```

## 🔍 **Verification Steps**

1. **Check your backend is running:**
   ```bash
   # Your backend should be running on localhost:8080
   curl http://localhost:8080/api/health
   ```

2. **Check the API calls in browser:**
   - Open Chrome DevTools (F12)
   - Go to Network tab
   - Look for API calls to `localhost:8080`

3. **Test with a simple API call:**
   ```javascript
   // This should now call your local database
   fetch('http://localhost:8080/api/hotels')
   ```

## 🐛 **Troubleshooting**

### **Still getting production data?**
1. **Clear browser cache** (Ctrl+Shift+R)
2. **Restart your development server:**
   ```bash
   npm run dev
   ```
3. **Check if your backend is running on port 8080**
4. **Verify the API calls in Network tab**

### **CORS Issues?**
Make sure your backend allows requests from `http://localhost:5173` (Vite dev server)

### **Backend not running?**
Start your backend server on port 8080 before running the frontend

## 📝 **Current Configuration**

Your app is now configured to use:
- **API Base URL:** `http://localhost:8080/api`
- **Config Base URL:** `http://localhost:8080`
- **Database:** Your local database

## ✅ **Next Steps**

1. **Start your backend server** on port 8080
2. **Restart your frontend:**
   ```bash
   npm run dev
   ```
3. **Test the application** - you should now see data from your local database

---

**🎉 Your app should now connect to your local database!** 