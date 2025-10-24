const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create square letterboxed versions of all card images
async function createSquareImages() {
  const publicDir = path.join(__dirname, '../public');
  const outputDir = path.join(publicDir, 'square');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('🖼️ Creating square letterboxed versions of all card images...');
  
  // Process all 24 card images (3 carousels × 8 images each)
  for (let carousel = 1; carousel <= 3; carousel++) {
    for (let image = 1; image <= 8; image++) {
      const inputPath = path.join(publicDir, `carousel${carousel}-image${image}.jpg`);
      const outputPath = path.join(outputDir, `carousel${carousel}-image${image}.jpg`);
      
      if (fs.existsSync(inputPath)) {
        try {
          // Get original image dimensions
          const metadata = await sharp(inputPath).metadata();
          console.log(`📏 Original ${path.basename(inputPath)}: ${metadata.width}x${metadata.height}`);
          
          // Create square version with letterboxing
          // Target: 858x858 (square) with the 858x286 image centered
          await sharp(inputPath)
            .resize(858, 858, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 1 } // Black background
            })
            .jpeg({ quality: 95 })
            .toFile(outputPath);
            
          console.log(`✅ Created square version: ${path.basename(outputPath)}`);
          
        } catch (error) {
          console.error(`❌ Error processing ${path.basename(inputPath)}:`, error);
        }
      } else {
        console.warn(`⚠️ File not found: ${inputPath}`);
      }
    }
  }
  
  console.log('🎉 Square image generation complete!');
}

createSquareImages().catch(console.error);
