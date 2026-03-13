/**
 * ensure-categories.js
 * Upserts the full set of expected categories into the DB without touching existing data.
 * Run once on any environment: node ensure-categories.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const CategoryModel = require('./src/Models/category.model');

const CATEGORIES = [
    { name: 'Solar Panel',              description: 'High-efficiency solar collectors' },
    { name: 'Battery',                  description: 'General energy storage solutions' },
    { name: 'Lithium Battery',          description: 'Lithium-ion and LiFePO4 deep-cycle batteries' },
    { name: 'Gel Battery',              description: 'Sealed gel lead-acid batteries' },
    { name: 'Inverter',                 description: 'Power conversion electronics' },
    { name: 'Charge Controller',        description: 'Solar charge regulation devices' },
    { name: 'Solar Lighting',           description: 'Solar-powered indoor and outdoor lighting' },
    { name: 'Flood Lights & Street Lights', description: 'High-output solar flood and street lighting' },
    { name: 'Garden Lights',            description: 'Decorative and security garden solar lights' },
    { name: 'Mounting Systems',         description: 'Roof and ground-mount racking for solar panels' },
    { name: 'Water Heaters',            description: 'Solar and electric water heating systems' },
    { name: 'Family Solar Packages',    description: 'All-in-one solar kits for households' },
];

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) { console.error('DATABASE_URL not set in .env'); process.exit(1); }

    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    for (const cat of CATEGORIES) {
        const existing = await CategoryModel.findOne({ name: cat.name });
        if (existing) {
            console.log(`  EXISTS  : ${cat.name}`);
        } else {
            await CategoryModel.create(cat);
            console.log(`  CREATED : ${cat.name}`);
        }
    }

    console.log('\nDone.');
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
