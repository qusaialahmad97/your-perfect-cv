// src/services/aiService.js

// This is now a private helper function, not directly accessible outside this file.
async function _callAI(prompt, temperature = 0.5) {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'AI service returned an error.');
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No content received from AI.');
    }
    return text.trim();
  } catch (error) {
    console.error('AI Service Call Error:', error);
    throw error;
  }
}

export const aiService = {
  async callAI(prompt, temperature = 0.5) {
    return await _callAI(prompt, temperature);
  },

  async generateFullCv(userInput, targetRole, jobDescription = '') {
    // --- UPDATED PROMPT FOR NEW SECTIONS ---
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
  "personalInformation": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "linkedin": "...",
    "city": "...",
    "country": "...",
    "portfolioLink": "...",
    "contact": "email | phone | linkedin"
  },
  "summary": "...",
  "experience": [
    {
      "jobTitle": "...",
      "company": "...",
      "duration": "...",
      "responsibilities": "...",
      "achievements": "..."
    }
  ],
  "education": [
    {
      "degree": "...",
      "institution": "...",
      "gradDate": "...",
      "gpa": "..."
    }
  ],
  "projects": [], // Keep empty if no specific input for projects, or integrate if you add a projectsRaw input
  "skills": {
    "technical": "...",
    "soft": "...",
    "languages": "..."
  },
  "references": [
    {
      "name": "...",
      "phone": "...",
      "position": "..."
    }
  ],
  "awards": [
    {
      "title": "...",
      "year": "...",
      "issuer": "..."
    }
  ],
  "courses": [
    {
      "title": "...",
      "institution": "...",
      "year": "..."
    }
  ],
  "certifications": [
    {
      "title": "...",
      "issuingBody": "...",
      "year": "..."
    }
  ],
  "customSections": [
    {
      "header": "...",
      "content": "..."
    }
  ]
}
\`\`\`
`;
    
    const responseText = await _callAI(prompt, 0.6); // It now calls the private helper
    
    try {
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse CV JSON from AI:", e, "--- Raw Text:", responseText);
        throw new Error("The AI returned an invalid CV format. Please try again. Raw response: " + responseText.substring(0, 200) + "..."); // Add raw response for debugging
    }
  },

  async refineText(text, jobDescription = '') {
    const context = jobDescription ? `Keep the following job description in mind for keywords: "${jobDescription}"` : '';
    const prompt = `Rewrite the following resume text to be more professional and impactful. Use strong action verbs. Return only the rewritten text, with no extra commentary. ${context}\n\nText to rewrite: "${text}"`;
    return await _callAI(prompt, 0.4); // Calls the private helper
  },

  async generateIdeas(jobTitle) {
    const prompt = `Generate 3 to 5 common, impactful resume bullet points for a "${jobTitle}" role. Each bullet point should start with an action verb. Return the points separated by a newline character (\n). Do not include numbering or any other text.`;
    return await _callAI(prompt, 0.8); // Calls the private helper
  },
};