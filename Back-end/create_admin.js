require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');

const createAdmin = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error('DATABASE_URL is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');

        const email = 'admin@admin.com';
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user = await User.findOne({ email });

        if (user) {
            console.log('User already exists. Updating to admin...');
            user.password = hashedPassword;
            user.isAdmin = true;
            user.username = 'Admin User'; // Ensure a name is set
            await user.save();
            console.log('User updated to admin successfully.');
        } else {
            console.log('Creating new admin user...');
            user = new User({
                username: 'Admin User',
                email,
                password: hashedPassword,
                isAdmin: true,
                gender: 'male' // Required by schema
            });
            await user.save();
            console.log('Admin user created successfully.');
        }

        console.log(`\nStats:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
