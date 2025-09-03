# 🚀 UTApi Implementation Guide

## ✅ **What We've Implemented**

I've created a proper UTApi implementation using Vercel serverless functions:

### 📁 **Files Created/Updated:**

1. **`api/delete-file.js`** - Serverless function using UTApi
2. **`src/shared/services/uploadService.jsx`** - Updated to call serverless function
3. **`vercel.json`** - Updated to handle API routes

## 🔧 **Setup Steps**

### **Step 1: Add Environment Variable to Vercel**

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `UPLOADTHING_SECRET`
   - **Value**: Your UploadThing secret key
   - **Environment**: Production, Preview, Development

### **Step 2: Deploy to Vercel**

```bash
# Deploy your changes
git add .
git commit -m "Add UTApi file deletion via serverless function"
git push
```

## 🎯 **How It Works**

### **Frontend Flow:**
```javascript
// User clicks delete button
const removeImage = async (index) => {
  const imageUrl = formData.photoUrls[index];
  
  // Call our updated service
  const result = await deleteFileByUrl(imageUrl);
  
  if (result.success) {
    // Remove from UI
    setFormData(prev => ({ ...prev, photoUrls: updatedPhotoUrls }));
    toast.success("Image deleted successfully");
  }
};
```

### **Backend Flow:**
```javascript
// api/delete-file.js
export async function DELETE(request) {
  const { fileUrl } = await request.json();
  const fileKey = extractFileKeyFromUrl(fileUrl);
  
  // Use UTApi properly
  await utapi.deleteFiles(fileKey);
  
  return Response.json({ success: true, message: "File deleted successfully" });
}
```

## 🔍 **Testing**

### **Local Development:**
```bash
# Start your dev server
npm run dev

# Test the API endpoint
curl -X DELETE http://localhost:5173/api/delete-file \
  -H "Content-Type: application/json" \
  -d '{"fileUrl": "https://utfs.io/f/your-file-key.jpg"}'
```

### **Production Testing:**
1. Deploy to Vercel
2. Go to your hotel admin dashboard
3. Try deleting an image
4. Check Vercel function logs for any errors

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **"UPLOADTHING_SECRET not found"**
   - Make sure you've added the environment variable to Vercel
   - Redeploy after adding the variable

2. **"Function not found"**
   - Check that `api/delete-file.js` is in your project root
   - Verify `vercel.json` has the API route configuration

3. **"File not found"**
   - Check that the file URL is valid
   - Verify the file key extraction is working

### **Debug Logs:**

The serverless function logs to Vercel. Check:
- Vercel Dashboard → Your Project → Functions → `delete-file` → Logs

## 🎉 **Benefits of This Approach**

✅ **Proper UTApi Usage** - Uses UploadThing's official SDK
✅ **Secure** - Secret key stays on server side
✅ **Scalable** - Serverless function handles load
✅ **Reliable** - Proper error handling and logging
✅ **Production Ready** - Works in Vercel environment

## 📝 **Next Steps**

1. **Add environment variable** to Vercel
2. **Deploy** your changes
3. **Test** the deletion functionality
4. **Monitor** function logs for any issues

Your file deletion is now using the proper UTApi approach! 🚀
