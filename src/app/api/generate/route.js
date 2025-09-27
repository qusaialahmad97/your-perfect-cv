// src/app/api/generate/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Get the prompt and temperature from the request body
    const { prompt, temperature = 0.5 } = await request.json();

    // 2. Get the secret Gemini API key from server-side environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    // --- ADD THESE LINES FOR DEBUGGING ---
    console.log('DEBUG: Value of GEMINI_API_KEY:', GEMINI_API_KEY);
    console.log('DEBUG: Type of GEMINI_API_KEY:', typeof GEMINI_API_KEY);
    console.log('DEBUG: Is GEMINI_API_KEY truthy?', !!GEMINI_API_KEY);
    // --- END DEBUG LINES ---

    // 3. Validate the input
    if (!GEMINI_API_KEY) {
      throw new Error('API key not configured on the server.');
    }
    if (!prompt) {
      return NextResponse.json({ message: 'Prompt is required.' }, { status: 400 });
    }

    // 4. Prepare the request to the real Gemini API
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: Number(temperature),
      }
    };

    // 5. Make the fetch call to the Gemini API
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await geminiResponse.json();

    // 6. Handle errors from the Gemini API
    if (!geminiResponse.ok) {
        console.error("Gemini API Error:", data);
        const errorMessage = data?.error?.message || 'An error occurred with the AI service.';
        throw new Error(errorMessage);
    }

    // 7. Return the successful response to our frontend
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API_GENERATE_ERROR]', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}