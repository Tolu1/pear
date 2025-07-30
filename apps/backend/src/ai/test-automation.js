// apps/backend/test-automation.js
// Simple test script to verify the automation endpoints work

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

// Mock screenshot (small base64 image)
const MOCK_SCREENSHOT =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Mock HTML
const MOCK_HTML = `
<!DOCTYPE html>
<html>
<head><title>Test Checkout</title></head>
<body>
  <div class="checkout-form">
    <input id="email" type="email" placeholder="Email">
    <input id="card-number" type="text" placeholder="Card Number">
    <button id="submit-btn" class="btn btn-yellow">Complete Purchase</button>
  </div>
</body>
</html>
`;

async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await fetch(`${BASE_URL}/api/automation/health`);
    const data = await response.json();
    console.log('✅ Health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testStartAutomation() {
  console.log('🚀 Testing start automation...');
  try {
    const response = await fetch(`${BASE_URL}/api/automation/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: 'test-session-123',
        screenshot: MOCK_SCREENSHOT,
        url: 'https://example.com/checkout',
        html: MOCK_HTML,
        goal: 'click the yellow submit button',
      }),
    });

    const data = await response.json();
    console.log('✅ Start automation response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Start automation failed:', error.message);
    return null;
  }
}

async function testContinueAutomation() {
  console.log('➡️ Testing continue automation...');
  try {
    const response = await fetch(`${BASE_URL}/api/automation/continue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: 'test-session-123',
        actionResults: [
          {
            actionId: 'action_1',
            success: true,
            executionTime: 150,
          },
        ],
        newScreenshot: MOCK_SCREENSHOT,
        currentUrl: 'https://example.com/checkout',
        newHtml: MOCK_HTML,
      }),
    });

    const data = await response.json();
    console.log(
      '✅ Continue automation response:',
      JSON.stringify(data, null, 2),
    );
    return data;
  } catch (error) {
    console.error('❌ Continue automation failed:', error.message);
    return null;
  }
}

async function testGetSession() {
  console.log('📋 Testing get session...');
  try {
    const response = await fetch(
      `${BASE_URL}/api/automation/session/test-session-123`,
    );
    const data = await response.json();
    console.log('✅ Get session response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Get session failed:', error.message);
    return null;
  }
}

async function testCloseSession() {
  console.log('🛑 Testing close session...');
  try {
    const response = await fetch(
      `${BASE_URL}/api/automation/session/test-session-123`,
      {
        method: 'DELETE',
      },
    );
    const data = await response.json();
    console.log('✅ Close session response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Close session failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting Backend Automation API Tests\n');

  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log(
      '❌ Health check failed - make sure the server is running on port 3002',
    );
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  await testStartAutomation();
  console.log('\n' + '-'.repeat(30) + '\n');

  await testGetSession();
  console.log('\n' + '-'.repeat(30) + '\n');

  await testContinueAutomation();
  console.log('\n' + '-'.repeat(30) + '\n');

  await testCloseSession();

  console.log('\n🎉 Tests completed!');
}

// Run the tests
runTests().catch(console.error);
