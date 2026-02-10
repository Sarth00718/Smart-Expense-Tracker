const axios = require('axios');

/**
 * Call Groq API (Primary and only AI provider)
 */
async function callGroq(prompt, systemMessage, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Groq API key not configured in environment variables');
    throw new Error('Groq API key not configured');
  }

  const { maxTokens = 500, temperature = 0.7 } = options;

  try {
    console.log('🤖 Calling Groq API...');
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // Increased timeout to 30 seconds
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      const text = response.data.choices[0].message.content.trim();
      console.log('✅ Groq API response received:', text.substring(0, 100) + '...');
      
      return {
        success: true,
        text: text,
        api: 'groq'
      };
    }

    console.error('❌ Invalid Groq response format:', JSON.stringify(response.data));
    throw new Error('Invalid Groq response format');
  } catch (error) {
    // Detailed error logging
    if (error.response) {
      console.error('❌ Groq API HTTP error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // Handle specific error cases
      if (error.response.status === 401) {
        throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY environment variable.');
      } else if (error.response.status === 429) {
        throw new Error('Groq API rate limit exceeded. Please try again later.');
      } else if (error.response.status === 500) {
        throw new Error('Groq API server error. Please try again later.');
      }
    } else if (error.request) {
      console.error('❌ Groq API network error:', error.message);
      throw new Error('Network error connecting to Groq API. Please check your internet connection.');
    } else {
      console.error('❌ Groq API error:', error.message);
    }
    
    throw new Error(`Groq API failed: ${error.message}`);
  }
}

/**
 * Evaluate response quality
 */
function evaluateResponse(text, userMessage) {
  let score = 0;
  
  // Length check (prefer detailed but not too long)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 30 && wordCount <= 300) score += 30;
  else if (wordCount > 300) score += 15;
  else score += 10;
  
  // Contains currency symbols (relevant for finance)
  if (text.includes('₹') || text.includes('Rs')) score += 15;
  
  // Contains numbers (data-driven)
  if (/\d+/.test(text)) score += 15;
  
  // Contains bullet points or structure
  if (text.includes('•') || text.includes('-') || text.includes('*')) score += 10;
  
  // Contains actionable words
  const actionWords = ['should', 'can', 'try', 'consider', 'recommend', 'suggest', 'reduce', 'increase', 'save'];
  const hasActionWords = actionWords.some(word => text.toLowerCase().includes(word));
  if (hasActionWords) score += 15;
  
  // Not too generic
  const genericPhrases = ['i cannot', 'i don\'t have', 'unable to', 'sorry'];
  const isGeneric = genericPhrases.some(phrase => text.toLowerCase().includes(phrase));
  if (!isGeneric) score += 15;
  
  return score;
}

/**
 * Call AI using Groq (simplified - no fallback needed)
 */
async function callAIWithFallback(prompt, systemMessage, options = {}) {
  // Directly call Groq - it's our only provider
  return await callGroq(prompt, systemMessage, options);
}

/**
 * Call AI with retry logic
 */
async function callAIWithRetry(prompt, systemMessage, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 AI call attempt ${attempt}/${maxRetries}`);
      const result = await callAIWithFallback(prompt, systemMessage, options);
      console.log(`✅ AI call succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ AI call attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const waitTime = 1000 * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error(`❌ All ${maxRetries} AI call attempts failed`);
  throw lastError;
}

module.exports = {
  callGroq,
  callAIWithFallback,
  callAIWithRetry,
  evaluateResponse
};
