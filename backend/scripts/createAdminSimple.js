const bcrypt = require('bcryptjs');

// Simple admin user creation without database
const createAdminUser = async () => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('superadmin123', salt);

    const adminUser = {
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
    };

    console.log('✅ Admin user data prepared successfully!');
    console.log('Email:', adminUser.email);
    console.log('Username:', adminUser.username);
    console.log('Role:', adminUser.role);
    console.log('Password: superadmin123');
    console.log('\n🔐 Login credentials:');
    console.log('Email: konaduprince26@gmail.com');
    console.log('Password: superadmin123');
    console.log('\n📝 To create this user in the database, you can:');
    console.log('1. Use the registration form in the frontend');
    console.log('2. Or manually insert this data into MongoDB');
    console.log('\n📋 Registration data for frontend:');
    console.log(JSON.stringify({
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      username: adminUser.username,
      email: adminUser.email,
      password: 'superadmin123',
      confirmPassword: 'superadmin123'
    }, null, 2));

  } catch (error) {
    console.error('Error preparing admin user:', error);
  }
};

// Run the script
createAdminUser().then(() => {
  console.log('\n✅ Process completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
