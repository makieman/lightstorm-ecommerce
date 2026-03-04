const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Product = require('./src/Models/product.model');

const imageMapping = {
    'solar_panel_1_qxtw9x.jpg': 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop',
    'solar_panel_2_v3m1f6.jpg': 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=800&auto=format&fit=crop',
    'battery_1_m5z1w6.jpg': 'https://images.unsplash.com/photo-1611333523212-6e3da8491f2e?q=80&w=800&auto=format&fit=crop',
    'battery_2_j9z1f2.jpg': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop',
    'inverter_1_k9z1f4.jpg': 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=800&auto=format&fit=crop',
    'inverter_2_l9z1f5.jpg': 'https://images.unsplash.com/photo-1592833159155-c62df1b35624?q=80&w=800&auto=format&fit=crop'
};

const fixImages = async () => {
    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) throw new Error('DATABASE_URL not found in .env');

        console.log('Connecting to database...');
        await mongoose.connect(DATABASE_URL);
        console.log('Connected.');

        const products = await Product.find({ image: /cloudinary/ });
        console.log(`Found ${products.length} products with Cloudinary URLs.`);

        let updatedCount = 0;
        for (const prod of products) {
            let foundMatch = false;
            for (const [brokenFile, workingUrl] of Object.entries(imageMapping)) {
                if (prod.image.includes(brokenFile)) {
                    prod.image = workingUrl;
                    foundMatch = true;
                    break;
                }
            }

            if (foundMatch) {
                await prod.save();
                updatedCount++;
                console.log(`Updated image for product: ${prod.title}`);
            } else {
                console.log(`Skipping unknown Cloudinary URL: ${prod.image}`);
            }
        }

        console.log(`\nMigration completed. ${updatedCount} products updated.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

fixImages();
