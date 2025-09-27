// src/services/aiService.js

// A simple helper function to wait for a specified amount of time
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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


export const aiService = {
  // This function now just calls our new resilient helper.
  async callAI(prompt, temperature = 0.5) {
    return await _callAIWithRetries(prompt, temperature);
  },

  /**
   * Parses raw text from an uploaded CV into a structured JSON object.
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
    const prompt = `Act as an expert CV writer. Your task is to take the user's raw input and transform it into a professional, structured CV in a strict JSON format.
The target role is "${targetRole}". ${jobDescription ? `Analyze the following job description to identify and use keywords: ---${jobDescription}---` : ''}
User's raw input: ${JSON.stringify(userInput, null, 2)}

Your Task:
1. Combine relevant personal information (email, phone, linkedin) into a single, professional 'contact' string.
2. Professionally format the 'experienceRaw' text into an array of experience objects, each with "jobTitle", "company", "duration", "responsibilities", and "achievements". For duration, create a realistic string (e.g., "2019 - Present" or "Jan 2018 - Dec 2020"); DO NOT use words like "Estimated".
3. Professionally format the 'educationRaw' text into an array of education objects, each with "degree", "institution", "gradDate", and optionally "gpa".
4. Parse 'referencesRaw' into an array of reference objects, each with "name", "phone" (optional), and "position" (optional).
5. Parse 'awardsRaw' into an array of award objects, each with "title", "year" (optional), and "issuer" (optional).
6. Parse 'coursesRaw' into an array of course objects, each with "title", "institution" (optional), and "year" (optional).
7. Parse 'certificationsRaw' into an array of certification objects, each with "title", "issuingBody" (optional), and "year" (optional).
8. Parse 'customSectionsRaw' into an array of custom section objects. For each entry, identify a "header" and its "content".
9. Refine all text (summary, responsibilities, achievements, skills, descriptions in new sections) to be professional and impactful for the target role.
10. If a section is empty or no data is provided, return an empty array for it.

Output Format: You MUST return only a single, valid JSON object with the final, polished CV data.
The structure must be:
\`\`\`json
{
  "personalInformation": { "name": "...", "email": "...", "phone": "...", "linkedin": "...", "city": "...", "country": "...", "portfolioLink": "...", "contact": "email | phone | linkedin" },
  "summary": "...",
  "experience": [ { "jobTitle": "...", "company": "...", "duration": "...", "responsibilities": "...", "achievements": "..." } ],
  "education": [ { "degree": "...", "institution": "...", "gradDate": "...", "gpa": "..." } ],
  "projects": [],
  "skills": { "technical": "...", "soft": "...", "languages": "..." },
  "references": [ { "name": "...", "phone": "...", "position": "..." } ],
  "awards": [ { "title": "...", "year": "...", "issuer": "..." } ],
  "courses": [ { "title": "...", "institution": "...", "year": "..." } ],
  "certifications": [ { "title": "...", "issuingBody": "...", "year": "..." } ],
  "customSections": [ { "header": "...", "content": "..." } ]
}
\`\`\`
`;
    
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
    // Determine the main instruction for the AI.
    const instruction = userPrompt 
      ? `Follow the user's specific instruction: "${userPrompt}"` 
      : 'Perform a general improvement: make the text more professional, concise, and impactful for a CV. Use strong action verbs.';

    // Provide context about the job description, if available.
    const jobContext = jobDescription 
      ? `For context, here is the job description the user is applying for. Use it for keywords and tailoring: "${jobDescription}"` 
      : 'No job description was provided.';

    const prompt = `
      You are an expert CV writer and career coach. Your task is to rewrite a piece of text for a resume.
      
      **Instruction:**
      ${instruction}

      **Job Context:**
      ${jobContext}

      **Original Text to Rewrite:**
      "${text}"

      Return only the rewritten text, with no extra commentary, headers, or explanations.
    `;
    
    return await _callAIWithRetries(prompt, 0.4);
  },

  async generateIdeas(jobTitle) {
    const prompt = `Generate 3 to 5 common, impactful resume bullet points for a "${jobTitle}" role. Each bullet point should start with an action verb. Return the points separated by a newline character (\n). Do not include numbering or any other text.`;
    return await _callAIWithRetries(prompt, 0.8);
  },

  // --- NEW FUNCTION for the ATS Checker ---
  async rewriteBulletPoint(bulletPoint, jobTitle, jobDescription, missingKeywords = []) {
    const keywordContext = missingKeywords.length > 0 
      ? `Try to naturally incorporate one of these missing keywords if relevant: ${missingKeywords.slice(0, 3).join(', ')}.`
      : '';

    const prompt = `You are an expert CV writer for a "${jobTitle}" role. 
    Rewrite the following bullet point to be more impactful.
    - Start with a strong, specific action verb.
    - Quantify the result with numbers, percentages, or metrics where possible.
    - Frame it using the STAR method (Situation, Task, Action, Result) if applicable.
    ${keywordContext}
    
    Job Description for context: ---${jobDescription}---
    Original bullet point: "${bulletPoint}"

    Return ONLY the single rewritten bullet point as a string, with no extra text or quotation marks.`;
    
    // Use a higher temperature for creativity
    return await _callAIWithRetries(prompt, 0.7);
  },
};