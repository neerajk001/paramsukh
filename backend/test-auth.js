import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

let testPhone = '9876543210';
let testOTP = '';
let testName = 'Test User';
let testEmail = 'test@example.com';

console.log('🧪 Testing OTP Authentication\n');

// Test 1: Send OTP (New User)
async function testSendOTP() {
  console.log('📤 Test 1: Sending OTP to new user...');
  try {
    const response = await axios.post(`${API_URL}/send-otp`, {
      phone: testPhone
    });
    
    if (response.data.success) {
      console.log('✅ OTP sent successfully');
      console.log('📋 Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.otp) {
        testOTP = response.data.otp;
        console.log(`🔐 OTP received: ${testOTP}\n`);
      } else {
        console.log('⚠️  OTP not returned (check server console)\n');
      }
      return true;
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Verify OTP (Signup - New User)
async function testSignup() {
  console.log('📝 Test 2: Verify OTP (Signup - New User)...');
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, {
      phone: testPhone,
      otp: testOTP,
      name: testName,
      email: testEmail
    });
    
    if (response.data.success) {
      console.log('✅ Signup successful');
      console.log('📋 User data:', JSON.stringify(response.data.user, null, 2));
      console.log('🎫 Token:', response.data.token.substring(0, 30) + '...\n');
      return response.data.token;
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 3: Send OTP (Existing User)
async function testSendOTPExistingUser() {
  console.log('📤 Test 3: Sending OTP to existing user...');
  try {
    const response = await axios.post(`${API_URL}/send-otp`, {
      phone: testPhone
    });
    
    if (response.data.success) {
      console.log('✅ OTP sent successfully');
      console.log('📋 isNewUser:', response.data.isNewUser);
      
      if (response.data.otp) {
        testOTP = response.data.otp;
        console.log(`🔐 OTP received: ${testOTP}\n`);
      } else {
        console.log('⚠️  OTP not returned (check server console)\n');
      }
      return true;
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Verify OTP (Signin - Existing User)
async function testSignin() {
  console.log('🔑 Test 4: Verify OTP (Signin - Existing User)...');
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, {
      phone: testPhone,
      otp: testOTP
    });
    
    if (response.data.success) {
      console.log('✅ Signin successful');
      console.log('📋 User data:', JSON.stringify(response.data.user, null, 2));
      console.log('🎫 Token:', response.data.token.substring(0, 30) + '...\n');
      return response.data.token;
    }
  } catch (error) {
    console.error('❌ Test 4 failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 5: Get Current User
async function testGetCurrentUser(token) {
  console.log('👤 Test 5: Get Current User...');
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Get current user successful');
      console.log('📋 User data:', JSON.stringify(response.data.user, null, 2) + '\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Test 5 failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 6: Logout
async function testLogout(token) {
  console.log('🚪 Test 6: Logout...');
  try {
    const response = await axios.post(`${API_URL}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Logout successful\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Test 6 failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('========================================\n');
  
  let token = null;
  
  // Test 1: Send OTP
  const test1 = await testSendOTP();
  if (!test1) {
    console.log('\n❌ Tests stopped due to failure in Test 1');
    process.exit(1);
  }
  
  // Test 2: Signup (requires name+email)
  token = await testSignup();
  if (!token) {
    console.log('\n❌ Tests stopped due to failure in Test 2');
    process.exit(1);
  }
  
  // Test 3: Send OTP to existing user
  const test3 = await testSendOTPExistingUser();
  if (!test3) {
    console.log('\n❌ Tests stopped due to failure in Test 3');
    process.exit(1);
  }
  
  // Test 4: Signin (no name/email needed for existing users)
  token = await testSignin();
  if (!token) {
    console.log('\n❌ Tests stopped due to failure in Test 4');
    process.exit(1);
  }
  
  // Test 5: Get current user
  await testGetCurrentUser(token);
  
  // Test 6: Logout
  await testLogout(token);
  
  console.log('========================================');
  console.log('🎉 All tests completed!');
  console.log('========================================\n');
}

runTests().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
