// src/utils/parsePdf.js

// Import the library itself
import * as pdfjsLib from 'pdfjs-dist';

// --- THIS IS THE FIX ---
// In Next.js, we point to the static worker file we placed in the `public` directory.
// The URL will be relative to the root of the domain.
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
// --- END OF FIX ---


export const getTextFromPdf = async (file) => {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Please select a valid PDF file.');
  }

  // Use an ArrayBuffer to read the file data
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the PDF document
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  // Loop through each page to extract text
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};