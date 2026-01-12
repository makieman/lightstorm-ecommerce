const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Product = require('./src/Models/product.model');

const solarTemplates = {
    'Table': {
        category: 'Solar Panel',
        titles: ['Mono-Crystalline Solar Panel 450W', 'High-Efficiency 550W Module', 'Portable Solar Panel 100W'],
        details: 'Tier-1 high-efficiency monocrystalline cells with robust tempered glass and aluminum frame.',
        basePrice: 15000,
        wattage: '450W',
        voltage: '41.5V',
        images: [
            'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/solar_panel_1_qxtw9x.jpg',
            'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/solar_panel_2_v3m1f6.jpg'
        ]
    },
    'Chair': {
        category: 'Battery',
        titles: ['Lithium-Ion Battery 100Ah 12V', 'Deep Cycle Gel Battery 200Ah', 'LiFePO4 Power Storage 5kWh'],
        details: 'Long-life energy storage solution with built-in BMS for solar and backup power applications.',
        basePrice: 45000,
        voltage: '12V',
        batteryType: 'Lithium-Ion / LiFePO4',
        images: [
            'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/battery_1_m5z1w6.jpg',
            'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/battery_2_j9z1f2.jpg'
        ]
    },
    'Sofa': {
        category: 'Inverter',
        titles: ['Hybrid Solar Inverter 3KVA', 'Pure Sine Wave Inverter 5KW', 'Micro Inverter 800W'],
        details: 'Advanced power conversion with multiple protection features and LCD display for monitoring.',
        basePrice: 60000,
        voltage: '24V/48V',
        wattage: '3000W',
        images: [
            'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/inverter_1_k9z1f4.jpg',
            'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/inverter_2_l9z1f5.jpg'
        ]
    }
};

const solarize = async () => {
    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) {
            throw new Error('DATABASE_URL not found in .env');
        }

        console.log('Connecting to database...');
        await mongoose.connect(DATABASE_URL);
        console.log('Connected.');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to solarize.`);

        let count = 0;
        for (const prod of products) {
            const template = solarTemplates[prod.category] || solarTemplates['Table']; // Default to Table -> Panel if not found

            const randomSuffix = Math.floor(Math.random() * 1000);
            const titleIndex = count % template.titles.length;
            const imageIndex = count % template.images.length;

            prod.title = `${template.titles[titleIndex]} - Series ${randomSuffix}`;
            prod.category = template.category;
            prod.details = template.details;
            prod.price = template.basePrice + (randomSuffix * 10); // Add some variation
            prod.image = template.images[imageIndex];
            prod.wattage = template.wattage || '';
            prod.voltage = template.voltage || '';
            prod.batteryType = template.batteryType || '';
            prod.type = 'product';

            await prod.save();
            count++;
            console.log(`Solarized: ${prod.title}`);
        }

        console.log(`Successfully solarized ${count} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Solarization failed:', err);
        process.exit(1);
    }
};

solarize();
