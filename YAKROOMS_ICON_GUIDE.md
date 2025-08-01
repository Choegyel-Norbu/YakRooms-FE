# 🎨 YakRooms PWA Icon Guide

## 📱 **Generated Icons**

Your YakRooms PWA now uses custom icons generated from `public/images/YakRoomIcon.png`:

### **Icon Sizes Created:**
- `icon-72x72.png` (3.7KB) - Small devices
- `icon-96x96.png` (5.3KB) - Standard favicon
- `icon-128x128.png` (7.9KB) - Medium devices
- `icon-152x152.png` (10KB) - iOS home screen
- `icon-192x192.png` (13KB) - Android home screen
- `icon-384x384.png` (46KB) - Large displays
- `icon-512x512.png` (75KB) - High-resolution displays

## 🔧 **How to Regenerate Icons**

### **Option 1: Using npm script (Recommended)**
```bash
npm run generate-yakrooms-icons
```

### **Option 2: Direct script execution**
```bash
node scripts/generate-yakrooms-icons.js
```

## 📋 **Manifest Configuration**

Your `public/manifest.webmanifest` is already configured with:

```json
{
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## 🧪 **Testing Your Icons**

### **1. Maskable.app Testing**
Visit: https://maskable.app/editor
- Upload your `public/manifest.webmanifest` file
- Check how icons look in different shapes
- Verify safe area compliance

### **2. Chrome DevTools Testing**
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in the left sidebar
4. View icon previews and details

### **3. PWA Installation Test**
1. Build your project: `npm run build`
2. Serve the build: `npm run preview`
3. Open in Chrome
4. Look for the install prompt
5. Install and check the app icon on home screen

## 🎯 **Icon Purpose Explained**

- **`"purpose": "any"`** - Standard icons for normal display
- **`"purpose": "maskable"`** - Icons that can be shaped/masked by platforms

## 🔄 **Updating Icons**

### **To change the source image:**
1. Replace `public/images/YakRoomIcon.png` with your new image
2. Run: `npm run generate-yakrooms-icons`
3. Rebuild: `npm run build`

### **To add new icon sizes:**
1. Edit `scripts/generate-yakrooms-icons.js`
2. Add new sizes to the `iconSizes` array
3. Update `public/manifest.webmanifest`
4. Run the generation script

## 📱 **Platform-Specific Notes**

### **iOS:**
- Uses 152x152 icon for home screen
- Icons appear square by default

### **Android:**
- Uses 192x192 and 512x512 icons
- Supports adaptive icons with `maskable` purpose

### **Desktop:**
- Uses 192x192 and 512x512 icons
- Appears in taskbar and start menu

## ✅ **Verification Checklist**

- [ ] All icon files exist in `public/icons/`
- [ ] Manifest references correct icon paths
- [ ] Icons display correctly on maskable.app
- [ ] PWA installs successfully
- [ ] App icon appears properly on home screen
- [ ] Icons work in different display modes

## 🐛 **Troubleshooting**

### **Icons not showing:**
1. Check file paths in manifest
2. Verify icons exist in `public/icons/`
3. Clear browser cache
4. Rebuild and redeploy

### **Icons too small:**
- Ensure `purpose` is set to `"any"` (not `"any maskable"`)
- Check icon sizes are correct
- Verify manifest is properly configured

### **Icons not updating:**
1. Clear browser cache
2. Uninstall and reinstall PWA
3. Check service worker cache
4. Force refresh (Ctrl+Shift+R)

---

**🎉 Your YakRooms PWA now has custom icons!** 