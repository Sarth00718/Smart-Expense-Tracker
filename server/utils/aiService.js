const axios = require('axios');

/**
 * Call Groq API (Primary and only AI provider)
 */
async function callGroq(prompt, systemMessage, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  const { maxTokens = 500, temperature = 0.7 } = options;

  try {
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
        timeout: 30000
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      const text = response.data.choices[0].message.content.trim();
      
      return {
        success: true,
        text: text,
        api: 'groq'
      };
    }

    throw new Error('Invalid Groq response format');
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY environment variable.');
      } else if (error.response.status === 429) {
        throw new Error('Groq API rate limit exceeded. Please try again later.');
      } else if (error.response.status === 500) {
        throw new Error('Groq API server error. Please try again later.');
      }
    } else if (error.request) {
      throw new Error('Network error connecting to Groq API. Please check your internet connection.');
    }
    
    throw new Error(`Groq API failed: ${error.message}`);
  }
}

function evaluateResponse(text, userMessage) {
  let score = 0;
  
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 30 && wordCount <= 300) score += 30;
  else if (wordCount > 300) score += 15;
  else score += 10;
  
  if (text.includes('₹') || text.includes('Rs')) score += 15;
  if (/\d+/.test(text)) score += 15;
  if (text.includes('•') || text.includes('-') || text.includes('*')) score += 10;
  
  const actionWords = ['should', 'can', 'try', 'consider', 'recommend', 'suggest', 'reduce', 'increase', 'save'];
  const hasActionWords = actionWords.some(word => text.toLowerCase().includes(word));
  if (hasActionWords) score += 15;
  
  const genericPhrases = ['i cannot', 'i don\'t have', 'unable to', 'sorry'];
  const isGeneric = genericPhrases.some(phrase => text.toLowerCase().includes(phrase));
  if (!isGeneric) score += 15;
  
  return score;
}

async function callAIWithFallback(prompt, systemMessage, options = {}) {
  return await callGroq(prompt, systemMessage, options);
}

async function callAIWithRetry(prompt, systemMessage, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await callAIWithFallback(prompt, systemMessage, options);
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const waitTime = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  callGroq,
  callAIWithFallback,
  callAIWithRetry,
  evaluateResponse
};
