const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple user schema for testing
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

const testLogin = async () => {
  try {
    console.log('🔍 Testing admin login...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/quizmaster_pro');
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    console.log('👤 Looking for admin user...');
    const user = await User.findOne({ email: 'konaduprince26@gmail.com' });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('First Name:', user.firstName);
    console.log('Last Name:', user.lastName);

    // Test password
    console.log('\n🔐 Testing password...');
    const isPasswordValid = await bcrypt.compare('SuperAdmin123', user.password);
    
    if (isPasswordValid) {
      console.log('✅ Password is correct!');
      console.log('✅ Login test successful!');
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ Last login updated');
      
    } else {
      console.log('❌ Password is incorrect!');
    }

    console.log('\n🎉 Login test completed!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: konaduprince26@gmail.com');
    console.log('Password: SuperAdmin123');
    console.log('Role: admin');
    console.log('\n🌐 You can login at: http://localhost:3002/login');

  } catch (error) {
    console.error('❌ Login test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

testLogin().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

