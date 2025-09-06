const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple user schema for direct creation
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'premium', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const createAdminUser = async () => {
  try {
    console.log('🚀 Starting direct admin user creation...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/quizmaster_pro', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'konaduprince26@gmail.com' },
        { username: 'konaduprince26' }
      ]
    });

    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);
      console.log('ID:', existingAdmin._id);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
      
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('SuperAdmin123', salt);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      username: 'konaduprince26',
      email: 'konaduprince26@gmail.com',
      password: hashedPassword,
      firstName: 'Konadu',
      lastName: 'Prince',
      role: 'admin',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Username:', adminUser.username);
    console.log('Role:', adminUser.role);
    console.log('ID:', adminUser._id);
    console.log('Password: SuperAdmin123');
    
    console.log('\n🔐 Login credentials:');
    console.log('Email: konaduprince26@gmail.com');
    console.log('Password: SuperAdmin123');
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('ℹ️ User already exists with this email or username');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

// Test login
const testLogin = async () => {
  try {
    console.log('\n🔍 Testing login...');
    
    await mongoose.connect('mongodb://localhost:27017/quizmaster_pro', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.findOne({ email: 'konaduprince26@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    const isPasswordValid = await bcrypt.compare('SuperAdmin123', user.password);
    
    if (isPasswordValid) {
      console.log('✅ Login test successful!');
      console.log('User:', user.firstName, user.lastName);
      console.log('Role:', user.role);
      console.log('Email:', user.email);
    } else {
      console.log('❌ Login test failed - invalid password');
    }

  } catch (error) {
    console.error('❌ Login test error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

// Main execution
const main = async () => {
  await createAdminUser();
  await testLogin();
  
  console.log('\n🎉 Process completed!');
  console.log('\n📋 Summary:');
  console.log('Email: konaduprince26@gmail.com');
  console.log('Password: SuperAdmin123');
  console.log('Role: admin');
  console.log('\n🌐 You can now login at: http://localhost:3002/login');
  
  process.exit(0);
};

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
