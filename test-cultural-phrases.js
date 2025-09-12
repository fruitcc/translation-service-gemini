const baseURL = 'http://localhost:3001';

const culturalPhrases = [
  {
    text: "Break a leg!",
    context: "Theater/performance encouragement - wishing someone good luck before a show"
  },
  {
    text: "It's raining cats and dogs",
    context: "Idiom describing very heavy rain"
  },
  {
    text: "The ball is in your court",
    context: "Business negotiation - indicating it's the other person's turn to make a decision"
  },
  {
    text: "Thank you for having me",
    context: "Guest thanking host at the end of a dinner party"
  },
  {
    text: "Long time no see!",
    context: "Casual greeting when meeting an old friend after a long time"
  }
];

async function translatePhrase(phrase) {
  try {
    const response = await fetch(`${baseURL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: phrase.text,
        context: phrase.context,
        sourceLanguage: 'en',
        targetLanguage: 'ja'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n📝 Original:', phrase.text);
      console.log('🎭 Context:', phrase.context);
      console.log('🇯🇵 Japanese:', data.data.translatedText);
      console.log('─'.repeat(60));
    } else {
      console.log('❌ Translation failed for:', phrase.text);
      console.log('Error:', data.error.message);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Cultural English to Japanese Translations');
  console.log('='.repeat(60));
  
  for (const phrase of culturalPhrases) {
    await translatePhrase(phrase);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✅ All translations completed!');
}

runTests().catch(console.error);