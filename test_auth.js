const http = require('http');

console.log('Testing auth endpoint improvements...\n');

// Test 1: Register a new user without gender
const testUser = {
  username: 'testuser123',
  email: 'test@example.com',
  password: 'testpass123'
};

const postData = JSON.stringify(testUser);

const options = {
  hostname: 'localhost',
  port: 7000,
  path: '/api/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\nResponse:', JSON.stringify(result, null, 2));
      
      if (result.verificationToken) {
        console.log('\n✓ Email verification token generated successfully');
        
        // Test email verification
        testEmailVerification(result.verificationToken);
      } else {
        console.log('\n✗ No verification token found in response');
      }
    } catch (err) {
      console.log('\nRaw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(postData);
req.end();

function testEmailVerification(token) {
  console.log('\nTesting email verification...');
  
  const verifyData = JSON.stringify({ token: token });
  
  const verifyOptions = {
    hostname: 'localhost',
    port: 7000,
    path: '/api/users/verify-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(verifyData)
    }
  };
  
  const verifyReq = http.request(verifyOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Verification Status: ${res.statusCode}`);
      try {
        const result = JSON.parse(data);
        console.log('Verification Response:', JSON.stringify(result, null, 2));
        
        if (res.statusCode === 200 && result.message.includes('verified')) {
          console.log('\n✓ Email verification completed successfully');
          console.log('✓ JWT cookie should be set for automatic login');
        }
      } catch (err) {
        console.log('Verification Raw response:', data);
      }
    });
  });
  
  verifyReq.on('error', (err) => {
    console.error('Verification error:', err.message);
  });
  
  verifyReq.write(verifyData);
  verifyReq.end();
}