const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster-pro', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'konaduprince26@gmail.com' },
        { username: 'konaduprince26' }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);
      console.log('ID:', existingAdmin._id);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('superadmin123', salt);

    // Create admin user
    const adminUser = await User.create({
      username: 'konaduprince26',
      email: 'konaduprince26@gmail.com',
      password: hashedPassword,
      firstName: 'Konadu',
      lastName: 'Prince',
      role: 'admin',
      subscription: {
        type: 'enterprise',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
        },
      },
      stats: {
        quizzesCreated: 0,
        quizzesTaken: 0,
        totalScore: 0,
        averageScore: 0,
        streak: 0,
        level: 1,
        experience: 0,
      },
      isActive: true,
      isVerified: true,
      lastLogin: new Date(),
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Username:', adminUser.username);
    console.log('Role:', adminUser.role);
    console.log('ID:', adminUser._id);
    console.log('Password: superadmin123');
    console.log('\n🔐 Login credentials:');
    console.log('Email: konaduprince26@gmail.com');
    console.log('Password: superadmin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Main function
const main = async () => {
  console.log('🚀 Starting admin user creation...\n');
  
  await connectDB();
  await createAdminUser();
  
  console.log('\n✅ Process completed!');
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
