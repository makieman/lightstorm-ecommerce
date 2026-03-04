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
            'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=800&auto=format&fit=crop'
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
            'https://images.unsplash.com/photo-1611333523212-6e3da8491f2e?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop'
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
            'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1592833159155-c62df1b35624?q=80&w=800&auto=format&fit=crop'
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
