const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Configuration
const IMAGE_DIR = path.join(__dirname, 'assets', 'images');
const PRODUCT_DIR = path.join(__dirname, 'assets', 'Products');
const TARGET_SIZE = 600;
const CONCURRENCY = 5;

// Initialize image directory
fs.ensureDirSync(IMAGE_DIR);

async function processProducts() {
  try {
    // 1. Load all product data
    const productFiles = await fs.readdir(PRODUCT_DIR);
    const allProducts = [];

    // Read all product JSON files
    for (const file of productFiles) {
      if (path.extname(file) === '.json') {
        const filePath = path.join(PRODUCT_DIR, file);
        const products = await fs.readJson(filePath);
        allProducts.push({
          file,
          data: products.map(p => ({
            ...p,
            originalImage: p.image, // Preserve original URL
            _file: file // Track source file
          }))
        });
      }
    }

    // 2. Process images with concurrency control
    const queue = [];
    let processedCount = 0;

    for (const category of allProducts) {
      for (const product of category.data) {
        queue.push(
          (async () => {
            const productUUID = uuidv4(); // Generate UUID early for error handling
            try {
              // Generate unique filename using UUID
              const filename = `${productUUID}.webp`;
              const imagePath = path.join(IMAGE_DIR, filename);
              
              // Update product references
              product._id = productUUID;
              product.image = `/images/${filename}`;

              // Download and process image
              const response = await axios({
                url: product.originalImage,
                responseType: 'arraybuffer',
                timeout: 15000
              });

              await sharp(response.data)
                .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'inside' })
                .webp({ quality: 85 })
                .toFile(imagePath);

              processedCount++;
              console.log(`Processed ${processedCount}/${getTotalProducts(allProducts)}`);
            } catch (error) {
              // Enhanced error logging with both ID and URL
              console.error(`Failed processing:
                URL: ${product.originalImage}
                ID: ${productUUID}
                Error: ${error.message}`);
              product.image = '/images/fallback.webp';
            }
          })()
        );

        // Maintain concurrency
        if (queue.length >= CONCURRENCY) {
          await Promise.all(queue);
          queue.length = 0;
        }
      }
    }

    // Process remaining queue
    await Promise.all(queue);

    // 3. Update JSON files
    for (const category of allProducts) {
      const filePath = path.join(PRODUCT_DIR, category.file);
      const cleanData = category.data.map(({ _file, originalImage, ...rest }) => rest);
      await fs.writeJson(filePath, cleanData, { spaces: 2 });
    }

    console.log('✅ All images processed and JSON updated');
    console.log(`📁 Images saved to: ${IMAGE_DIR}`);

  } catch (error) {
    console.error('🚨 Global error:', error);
  }
}

// Helper function
function getTotalProducts(categories) {
  return categories.reduce((sum, cat) => sum + cat.data.length, 0);
}

// Run the processor
processProducts();