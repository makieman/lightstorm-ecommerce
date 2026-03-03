const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./src/Models/category.model');
const Product = require('./src/Models/product.model');

const initialData = [
    {
        category: 'Solar Panel',
        description: 'High-efficiency solar collectors',
        products: [
            {
                title: 'Mono-Crystalline Solar Panel 450W',
                details: 'Tier-1 high-efficiency monocrystalline cells with robust tempered glass and aluminum frame.',
                price: 15000,
                quantity: 50,
                wattage: '450W',
                voltage: '41.5V',
                image: 'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/solar_panel_1_qxtw9x.jpg'
            },
            {
                title: 'High-Efficiency 550W Module',
                details: 'Large format module for industrial applications with advanced multi-busbar technology.',
                price: 22000,
                quantity: 30,
                wattage: '550W',
                voltage: '42.0V',
                image: 'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/solar_panel_2_v3m1f6.jpg'
            }
        ]
    },
    {
        category: 'Battery',
        description: 'Energy storage solutions',
        products: [
            {
                title: 'Lithium-Ion Battery 100Ah 12V',
                details: 'Long-life energy storage solution with built-in BMS for solar and backup power applications.',
                price: 45000,
                quantity: 20,
                voltage: '12V',
                batteryType: 'Lithium-Ion',
                image: 'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/battery_1_m5z1w6.jpg'
            },
            {
                title: 'LiFePO4 Power Storage 5kWh',
                details: 'Scalable wall-mounted energy storage system with deep cycle capabilities.',
                price: 180000,
                quantity: 10,
                voltage: '48V',
                batteryType: 'LiFePO4',
                image: 'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/battery_2_j9z1f2.jpg'
            }
        ]
    },
    {
        category: 'Inverter',
        description: 'Power conversion electronics',
        products: [
            {
                title: 'Hybrid Solar Inverter 3KVA',
                details: 'Advanced hybrid inverter supporting both solar and grid charging with UPS functionality.',
                price: 60000,
                quantity: 15,
                voltage: '24V',
                wattage: '3000W',
                image: 'https://res.cloudinary.com/dh7osyxvl/image/upload/v1736683833/inverter_1_k9z1f4.jpg'
            }
        ]
    }
];

const seedDB = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL not found in .env');

        console.log('Connecting to MongoDB...');
        await mongoose.connect(dbUrl);
        console.log('Connected.');

        // Optional: Clear existing data (Uncomment if needed)
        // console.log('Clearing old data...');
        // await Category.deleteMany({});
        // await Product.deleteMany({});

        for (const group of initialData) {
            console.log(`Processing category: ${group.category}`);

            let cat = await Category.findOne({ name: group.category });
            if (!cat) {
                cat = await Category.create({
                    name: group.category,
                    description: group.description
                });
                console.log(`Created new category: ${cat.name}`);
            }

            for (const p of group.products) {
                const existing = await Product.findOne({ title: p.title });
                if (!existing) {
                    await Product.create({ ...p, category: cat._id });
                    console.log(`  Added product: ${p.title}`);
                } else {
                    console.log(`  Product already exists: ${p.title}`);
                }
            }
        }

        console.log('\nSeeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
