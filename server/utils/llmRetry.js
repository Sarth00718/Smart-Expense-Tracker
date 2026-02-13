const axios = require('axios');

/**
 * Call Groq API with exponential backoff retry logic
 * @param {string} userPrompt - The user's prompt
 * @param {string} systemPrompt - System instructions
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - AI response text
 */
async function callGroqWithRetry(userPrompt, systemPrompt, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    maxTokens = 500,
    temperature = 0.7,
    model = 'llama-3.1-8b-instant'
  } = options;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
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

      return response.data.choices[0].message.content;

    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw new Error(`AI service error: ${error.response.data?.error?.message || 'Invalid request'}`);
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  throw new Error(`AI service unavailable after ${maxRetries} attempts. Please try again later.`);
}

/**
 * Call OpenAI API with exponential backoff retry logic
 * @param {string} userPrompt - The user's prompt
 * @param {string} systemPrompt - System instructions
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - AI response text
 */
async function callOpenAIWithRetry(userPrompt, systemPrompt, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    maxTokens = 500,
    temperature = 0.7,
    model = 'gpt-3.5-turbo'
  } = options;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
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

      return response.data.choices[0].message.content;

    } catch (error) {
      lastError = error;
      
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw new Error(`AI service error: ${error.response.data?.error?.message || 'Invalid request'}`);
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`AI service unavailable after ${maxRetries} attempts. Please try again later.`);
}

module.exports = {
  callGroqWithRetry,
  callOpenAIWithRetry
};
