// src/app/api/scrape-job/route.js

import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// This is the function that will be called when a POST request is made to /api/scrape-job
export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes('linkedin.com/jobs/view')) {
            return NextResponse.json(
                { error: 'A valid LinkedIn job URL is required.' },
                { status: 400 }
            );
        }

        // Fetch the HTML content of the LinkedIn page
        // We add a user-agent header to mimic a real browser request
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // This is the specific selector for the main job description content on LinkedIn.
        // LinkedIn might change their website structure, so this might need updating in the future.
        const jobDescriptionText = $('.description__text--rich').text();

        // Clean up the text: trim whitespace and handle multiple newlines
        const cleanedText = jobDescriptionText.replace(/\n\s*\n/g, '\n').trim();

        if (!cleanedText) {
            // If the selector didn't find anything, the page structure might have changed or it's a different type of page.
            return NextResponse.json(
                { error: 'Could not extract job description. The page structure may have changed or the content is protected.' },
                { status: 500 }
            );
        }
        
        return NextResponse.json({ jobDescription: cleanedText });

    } catch (error) {
        console.error('Scraping failed:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred during scraping.' },
            { status: 500 }
        );
    }
}