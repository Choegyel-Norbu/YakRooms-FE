import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy the base icon to all required sizes
// In a real implementation, you would use an image processing library like sharp
// For now, we'll copy the same file with different names
const baseIcon = path.join(__dirname, '../src/assets/images/YakRoomsLOGO.png');

iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  if (!fs.existsSync(iconPath)) {
    fs.copyFileSync(baseIcon, iconPath);
    console.log(`Created icon-${size}x${size}.png`);
  }
});

console.log('PWA icons generated successfully!');
console.log('Note: In production, you should use an image processing library to resize the icons properly.'); 