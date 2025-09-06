const axios = require('axios');

// Admin user registration data
const adminData = {
  firstName: 'Konadu',
  lastName: 'Prince',
  username: 'konaduprince26',
  email: 'konaduprince26@gmail.com',
  password: 'SuperAdmin123',
  confirmPassword: 'SuperAdmin123'
};

// Login data
const loginData = {
  email: 'konaduprince26@gmail.com',
  password: 'SuperAdmin123'
};

const registerAndLoginAdmin = async () => {
  try {
    console.log('🚀 Starting admin registration and login process...\n');

    // Step 1: Register the admin user
    console.log('📝 Step 1: Registering admin user...');
    try {
      const registerResponse = await axios.post('http://localhost:5002/api/auth/register', adminData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (registerResponse.data.success) {
        console.log('✅ Admin user registered successfully!');
        console.log('User ID:', registerResponse.data.user._id);
        console.log('Role:', registerResponse.data.user.role);
      } else {
        console.log('⚠️ Registration response:', registerResponse.data);
      }
    } catch (registerError) {
      if (registerError.response) {
        if (registerError.response.status === 400 && 
            (registerError.response.data.message.includes('already registered') || 
             registerError.response.data.message.includes('already taken'))) {
          console.log('ℹ️ Admin user already exists, proceeding to login...');
        } else {
          console.log('❌ Registration error:', registerError.response.data);
        }
      } else {
        console.log('❌ Registration network error:', registerError.message);
      }
    }

    // Step 2: Login with the admin user
    console.log('\n🔐 Step 2: Logging in as admin...');
    try {
      const loginResponse = await axios.post('http://localhost:5002/api/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (loginResponse.data.success) {
        console.log('✅ Admin login successful!');
        console.log('Token:', loginResponse.data.token ? 'Generated' : 'Not generated');
        console.log('User ID:', loginResponse.data.user._id);
        console.log('Email:', loginResponse.data.user.email);
        console.log('Username:', loginResponse.data.user.username);
        console.log('Role:', loginResponse.data.user.role);
        console.log('First Name:', loginResponse.data.user.firstName);
        console.log('Last Name:', loginResponse.data.user.lastName);
        
        // Step 3: Test admin access
        console.log('\n🔑 Step 3: Testing admin access...');
        try {
          const meResponse = await axios.get('http://localhost:5002/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${loginResponse.data.token}`,
            },
            timeout: 10000
          });

          if (meResponse.data.success) {
            console.log('✅ Admin access verified!');
            console.log('Current user role:', meResponse.data.user.role);
            console.log('Is admin:', meResponse.data.user.role === 'admin');
          }
        } catch (meError) {
          console.log('❌ Admin access test failed:', meError.response?.data || meError.message);
        }

      } else {
        console.log('❌ Login failed:', loginResponse.data);
      }
    } catch (loginError) {
      if (loginError.response) {
        console.log('❌ Login error:', loginError.response.data);
      } else {
        console.log('❌ Login network error:', loginError.message);
      }
    }

    console.log('\n🎉 Process completed!');
    console.log('\n📋 Summary:');
    console.log('Email: konaduprince26@gmail.com');
    console.log('Password: superadmin123');
    console.log('Role: admin');
    console.log('\n🌐 You can now login at: http://localhost:3002/login');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
};

// Check if backend is running
const checkBackend = async () => {
  try {
    await axios.get('http://localhost:5002/health', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('🔍 Checking if backend server is running...');
  const backendRunning = await checkBackend();
  
  if (!backendRunning) {
    console.log('❌ Backend server is not running on http://localhost:5002');
    console.log('Please start the backend server first:');
    console.log('cd backend && npm start');
    process.exit(1);
  }
  
  console.log('✅ Backend server is running!');
  await registerAndLoginAdmin();
};

main();
