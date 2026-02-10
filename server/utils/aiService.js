const axios = require('axios');

/**
 * Call Gemini API
 */
async function callGemini(prompt, systemMessage, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const { maxTokens = 500, temperature = 0.7 } = options;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: `${systemMessage}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.95,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        success: true,
        text: response.data.candidates[0].content.parts[0].text.trim(),
        api: 'gemini'
      };
    }

    throw new Error('Invalid Gemini response format');
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw new Error(`Gemini failed: ${error.message}`);
  }
}

/**
 * Call Groq API
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
        timeout: 15000
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return {
        success: true,
        text: response.data.choices[0].message.content.trim(),
        api: 'groq'
      };
    }

    throw new Error('Invalid Groq response format');
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);
    throw new Error(`Groq failed: ${error.message}`);
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
 * Call AI with Gemini primary, Groq fallback, and best response selection
 */
async function callAIWithFallback(prompt, systemMessage, options = {}) {
  const results = [];
  
  // Try Gemini first
  try {
    const geminiResult = await callGemini(prompt, systemMessage, options);
    results.push(geminiResult);
  } catch (geminiError) {
    console.log('Gemini failed, trying Groq:', geminiError.message);
  }
  
  // Try Groq as fallback or for comparison
  try {
    const groqResult = await callGroq(prompt, systemMessage, options);
    results.push(groqResult);
  } catch (groqError) {
    console.log('Groq also failed:', groqError.message);
  }
  
  // If both failed, throw error
  if (results.length === 0) {
    throw new Error('Both Gemini and Groq APIs failed');
  }
  
  // If only one succeeded, return it
  if (results.length === 1) {
    return results[0];
  }
  
  // Both succeeded - evaluate and return best
  const geminiScore = evaluateResponse(results[0].text, prompt);
  const groqScore = evaluateResponse(results[1].text, prompt);
  
  console.log(`Response scores - Gemini: ${geminiScore}, Groq: ${groqScore}`);
  
  // Return the better response
  if (geminiScore >= groqScore) {
    console.log('Selected Gemini response');
    return results[0];
  } else {
    console.log('Selected Groq response');
    return results[1];
  }
}

/**
 * Call AI with retry logic
 */
async function callAIWithRetry(prompt, systemMessage, options = {}, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callAIWithFallback(prompt, systemMessage, options);
    } catch (error) {
      lastError = error;
      console.error(`AI call attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  callGemini,
  callGroq,
  callAIWithFallback,
  callAIWithRetry,
  evaluateResponse
};
