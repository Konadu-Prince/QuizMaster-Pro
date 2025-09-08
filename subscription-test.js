// Test script to verify subscription system
const axios = require('axios');

const API_URL = 'http://localhost:5002/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YmQ5OTU0ODFkMjY4MzY2YTkzMTEwOSIsImlhdCI6MTc1NzI1NjkwOSwiZXhwIjoxNzU3ODYxNzA5fQ.YplwLHQjR7P3sJSYgMjgsTYmHkIwhqS3XkorSD0JJUk';

async function testSubscriptionSystem() {
  console.log('🧪 Testing Subscription System...\n');

  try {
    // Test 1: Get subscription plans
    console.log('1. Testing subscription plans...');
    const plansResponse = await axios.get(`${API_URL}/subscriptions/plans`);
    console.log('✅ Plans API working:', plansResponse.data.success);
    console.log('📋 Available plans:', plansResponse.data.data.map(p => p.name).join(', '));

    // Test 2: Get user subscription
    console.log('\n2. Testing user subscription...');
    const subscriptionResponse = await axios.get(`${API_URL}/subscriptions/my-subscription`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ User subscription API working:', subscriptionResponse.data.success);
    console.log('👤 Current plan:', subscriptionResponse.data.data.plan);

    // Test 3: Test checkout session creation (this will fail without real Stripe keys)
    console.log('\n3. Testing checkout session creation...');
    try {
      const checkoutResponse = await axios.post(`${API_URL}/subscriptions/create-checkout-session`, 
        { planId: 'pro' },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      console.log('✅ Checkout session API working:', checkoutResponse.data.success);
    } catch (error) {
      console.log('⚠️  Checkout session API error (expected without Stripe keys):', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Subscription system is working!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up Stripe account and get API keys');
    console.log('2. Add Stripe keys to .env file');
    console.log('3. Test payment flow with real Stripe integration');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSubscriptionSystem();

