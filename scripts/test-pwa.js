import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing YakRooms PWA Implementation...\n');

// Check if dist folder exists
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ Dist folder not found. Run "npm run build" first.');
  process.exit(1);
}

// Check for required PWA files
const requiredFiles = [
  'manifest.webmanifest',
  'sw.js',
  'workbox-74f2ef77.js',
  'favicon.ico',
  'apple-touch-icon.png',
  'masked-icon.svg'
];

const missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ Missing PWA files:', missingFiles.join(', '));
} else {
  console.log('✅ All required PWA files found');
}

// Check icons directory
const iconsPath = path.join(distPath, 'icons');
if (fs.existsSync(iconsPath)) {
  const iconFiles = fs.readdirSync(iconsPath);
  const requiredIcons = [
    'icon-72x72.png',
    'icon-96x96.png',
    'icon-128x128.png',
    'icon-144x144.png',
    'icon-152x152.png',
    'icon-192x192.png',
    'icon-384x384.png',
    'icon-512x512.png'
  ];
  
  const missingIcons = requiredIcons.filter(icon => !iconFiles.includes(icon));
  
  if (missingIcons.length > 0) {
    console.log('❌ Missing icons:', missingIcons.join(', '));
  } else {
    console.log('✅ All required PWA icons found');
  }
} else {
  console.log('❌ Icons directory not found');
}

// Check manifest content
const manifestPath = path.join(distPath, 'manifest.webmanifest');
if (fs.existsSync(manifestPath)) {
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const requiredManifestFields = [
      'name',
      'short_name',
      'description',
      'theme_color',
      'background_color',
      'display',
      'start_url',
      'icons'
    ];
    
    const missingFields = requiredManifestFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing manifest fields:', missingFields.join(', '));
    } else {
      console.log('✅ Manifest contains all required fields');
    }
    
    if (manifest.icons && manifest.icons.length >= 8) {
      console.log('✅ Manifest has sufficient icons');
    } else {
      console.log('❌ Manifest needs more icons');
    }
  } catch (error) {
    console.log('❌ Error reading manifest:', error.message);
  }
}

console.log('\n🎉 PWA test completed!');
console.log('\n📋 Next steps:');
console.log('1. Open Chrome DevTools > Application tab');
console.log('2. Check Manifest section for proper configuration');
console.log('3. Test install prompt in browser');
console.log('4. Run Lighthouse audit for PWA compliance');
console.log('5. Test offline functionality'); 