// src/services/aiService.js

// A simple helper function to wait for a specified amount of time
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ⭐⭐⭐ --- START: NEW RESILIENT HELPER FUNCTION --- ⭐⭐⭐
// This is the private helper that all other functions will use. It now has retry logic built-in.
async function _callAIWithRetries(prompt, temperature = 0.5) {
  const maxRetries = 3;
  let delay = 1000; // Start with a 1-second delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // --- The original API call logic is inside the loop ---
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, temperature }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || 'AI service returned an unknown error.');
      }

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No content received from AI.');
      }
      return text.trim(); // Success! Exit the loop and return the text.

    } catch (error) {
      console.warn(`AI Service Call Attempt ${attempt} failed: ${error.message}`);

      // If this was the last attempt, re-throw the error to let the calling function handle it
      if (attempt === maxRetries) {
        console.error("AI Service Call Error: All retry attempts failed.", error);
        throw error; // Give up
      }

      // Check if the error is a retryable "overloaded" or server error
      if (error.message.includes('overloaded') || error.message.includes('500') || error.message.includes('server')) {
        console.log(`AI service is busy. Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
      } else {
        // If it's a different error (e.g., bad input), don't retry.
        throw error;
      }
    }
  }
}
// ⭐⭐⭐ --- END: NEW RESILIENT HELPER FUNCTION --- ⭐⭐⭐


export const aiService = {
  // This function now just calls our new resilient helper.
  async callAI(prompt, temperature = 0.5) {
    return await _callAIWithRetries(prompt, temperature);
  },

  /**
   * NEW: Parses raw text from an uploaded CV into a structured JSON object.
   * @param {string} cvText - The raw text extracted from the user's CV PDF.
   * @returns {Promise<object>} A promise that resolves to a structured CV data object.
   */
  async parseCvText(cvText) {
    const prompt = `
      You are an expert CV parsing AI. Your task is to analyze the following raw text from a CV and convert it into a structured JSON object.
      The JSON object must match this exact structure. Only return the JSON object itself, with no extra text, explanations, or markdown formatting.

      Extract the following fields:
      - personalInformation: including name, email, phone, linkedin, city, and country.
      - summary: The professional summary or objective section.
      - experience: An array of jobs. For each job, extract role, company, startDate, endDate, and a description of achievements/responsibilities.
      - education: An array of educational qualifications. For each, extract degree, institution, and graduationYear.
      - skills: An object with two keys, "technical" and "soft", containing comma-separated lists of skills.

      JSON structure to follow:
      \`\`\`json
      {
        "personalInformation": { "name": "", "email": "", "phone": "", "linkedin": "", "city": "", "country": "" },
        "summary": "",
        "experience": [
          { "role": "", "company": "", "startDate": "", "endDate": "", "achievements": "" }
        ],
        "education": [
          { "degree": "", "institution": "", "graduationYear": "" }
        ],
        "skills": { "technical": "", "soft": "" }
      }
      \`\`\`

      Here is the CV text to parse:
      ---
      ${cvText}
      ---
    `;

    // Use a low temperature for parsing to ensure accuracy and reduce creativity.
    const responseText = await _callAIWithRetries(prompt, 0.3);

    try {
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse uploaded CV JSON from AI:", e, "--- Raw Text:", responseText);
      throw new Error("Could not understand the format of the uploaded CV. Please try a different file or fill out the fields manually.");
    }
  },

  async generateFullCv(userInput, targetRole, jobDescription = '') {
    const prompt = `Act as an expert CV writer...`; // Prompt text is long, so truncated for brevity. It does not need to change.
    
    // This now calls the resilient helper function
    const responseText = await _callAIWithRetries(prompt, 0.6);
    
    try {
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse CV JSON from AI:", e, "--- Raw Text:", responseText);
        throw new Error("The AI returned an invalid CV format. Please try again.");
    }
  },

  async refineText(text, jobDescription = '', userPrompt = '') {
    const instruction = userPrompt ? `...` : `...`; // Prompt text is long, so truncated for brevity. It does not need to change.
    const jobContext = jobDescription ? `...` : `...`;
    const prompt = `...`;
    
    // This now calls the resilient helper function
    return await _callAIWithRetries(prompt, 0.4);
  },

  async generateIdeas(jobTitle) {
    const prompt = `Generate 3 to 5 common, impactful resume bullet points for a "${jobTitle}" role...`; // Prompt text does not need to change.
    
    // This now calls the resilient helper function
    return await _callAIWithRetries(prompt, 0.8);
  },
};