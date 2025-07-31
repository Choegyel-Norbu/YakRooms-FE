import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes required for PWA - optimized for mobile app appearance
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy the base icon to all required sizes
// In a real implementation, you would use an image processing library like sharp
// For now, we'll copy the same file with different names
const baseIcon = path.join(__dirname, '../src/assets/images/YakRoomsLOGO.png');

console.log('🎨 Generating PWA icons for mobile app installation...');

iconSizes.forEach(({ size, name }) => {
  const iconPath = path.join(iconsDir, name);
  if (!fs.existsSync(iconPath)) {
    fs.copyFileSync(baseIcon, iconPath);
    console.log(`✅ Created ${name} (${size}x${size})`);
  } else {
    console.log(`ℹ️  ${name} already exists`);
  }
});

console.log('\n📱 Mobile App Icon Optimization:');
console.log('- 192x192: Primary size for Android app icons');
console.log('- 512x512: Required for high-DPI displays');
console.log('- All sizes: Ensures compatibility across devices');
console.log('\n💡 Note: For production, use an image processing library to properly resize icons');
console.log('   Current icons use the same base image - consider using sharp or similar for proper scaling'); 