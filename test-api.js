const baseURL = 'http://localhost:3000';

async function testAPI() {
  console.log('Testing Translation Service API...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResponse = await fetch(`${baseURL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✓ Health Check:', healthData.data.status);
  } catch (error) {
    console.log('✗ Health Check failed:', error.message);
  }

  // Test 2: Get Languages
  console.log('\n2. Testing Get Languages...');
  try {
    const langResponse = await fetch(`${baseURL}/api/languages`);
    const langData = await langResponse.json();
    console.log(`✓ Languages Available: ${langData.data.count} languages`);
    console.log('  Sample:', langData.data.languages.slice(0, 3).map(l => `${l.name} (${l.code})`).join(', '));
  } catch (error) {
    console.log('✗ Get Languages failed:', error.message);
  }

  // Test 3: Translation (will fail without API key)
  console.log('\n3. Testing Translation...');
  try {
    const translationResponse = await fetch(`${baseURL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, how are you today?',
        context: 'Casual greeting between friends',
        sourceLanguage: 'en',
        targetLanguage: 'es',
      }),
    });
    const translationData = await translationResponse.json();
    
    if (translationData.success) {
      console.log('✓ Translation successful:');
      console.log(`  Original: "${translationData.data.originalText}"`);
      console.log(`  Translated: "${translationData.data.translatedText}"`);
    } else {
      console.log('✗ Translation failed:', translationData.error.message);
      console.log('  Note: This is expected if GEMINI_API_KEY is not set');
    }
  } catch (error) {
    console.log('✗ Translation request failed:', error.message);
  }

  // Test 4: Validation Error
  console.log('\n4. Testing Validation Error Handling...');
  try {
    const errorResponse = await fetch(`${baseURL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: '', // Empty text should trigger validation error
        sourceLanguage: 'en',
        targetLanguage: 'es',
      }),
    });
    const errorData = await errorResponse.json();
    
    if (!errorData.success) {
      console.log('✓ Validation error handled correctly');
      console.log('  Error:', errorData.error.details[0].message);
    } else {
      console.log('✗ Validation should have failed for empty text');
    }
  } catch (error) {
    console.log('✗ Validation test failed:', error.message);
  }

  console.log('\n✅ API tests completed!');
}

testAPI().catch(console.error);