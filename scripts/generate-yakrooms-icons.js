import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes for PWA
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

// Paths
const sourceImagePath = path.join(__dirname, '../public/images/er.png');
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('✅ Created icons directory');
}

console.log('🎨 Generating PWA icons from er.png...');
console.log('📁 Source image:', sourceImagePath);
console.log('📁 Output directory:', iconsDir);

// Check if source image exists
if (!fs.existsSync(sourceImagePath)) {
  console.error('❌ Source image not found:', sourceImagePath);
  console.log('Please ensure er.png exists in public/images/');
  process.exit(1);
}

// Generate icons using sharp
async function generateIcons() {
  try {
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(iconsDir, name);
      
      await sharp(sourceImagePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
    
    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\n📱 Icon files created:');
    iconSizes.forEach(({ name }) => {
      console.log(`   - ${name}`);
    });
    
    console.log('\n🔗 Test your icons on:');
    console.log('- https://maskable.app/editor');
    console.log('- Chrome DevTools > Application > Manifest');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the icon generation
generateIcons(); 