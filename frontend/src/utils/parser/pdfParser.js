// Advanced PDF parser using pdfjs-dist
import { extractAllInfo, getBestCandidateInfo } from '../extractor';

/**
 * Extract text from PDF file using pdfjs-dist
 */
export async function extractTextFromPDF(file) {
  try {
    // Dynamic import to avoid forcing dependency
    const pdfjsLib = await import('pdfjs-dist/build/pdf');

    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const pageTexts = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine text items with appropriate spacing
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        pageTexts.push({
          pageNumber: pageNum,
          text: pageText
        });

        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageError);
        pageTexts.push({
          pageNumber: pageNum,
          text: '',
          error: pageError.message
        });
      }
    }

    return {
      success: true,
      text: fullText.trim(),
      pageCount: pdf.numPages,
      pages: pageTexts,
      metadata: {
        title: pdf._pdfInfo?.title || '',
        author: pdf._pdfInfo?.author || '',
        subject: pdf._pdfInfo?.subject || '',
        creator: pdf._pdfInfo?.creator || '',
        producer: pdf._pdfInfo?.producer || '',
        creationDate: pdf._pdfInfo?.creationDate || '',
        modificationDate: pdf._pdfInfo?.modificationDate || ''
      }
    };

  } catch (error) {
    console.error('PDF parsing error:', error);

    // Fallback to simple file reading
    try {
      const fallbackText = await readFileAsText(file);
      return {
        success: false,
        text: fallbackText,
        pageCount: 1,
        pages: [{ pageNumber: 1, text: fallbackText }],
        error: error.message,
        fallback: true
      };
    } catch (fallbackError) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }
}

/**
 * Parse PDF resume and extract candidate information
 */
export async function parsePDFResume(file) {
  try {
    // Validate file type
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Invalid file type. Please upload a PDF file.');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload a file smaller than 10MB.');
    }

    // Extract text from PDF
    const extractionResult = await extractTextFromPDF(file);

    if (!extractionResult.text || extractionResult.text.trim().length === 0) {
      throw new Error('Could not extract text from PDF. The file might be image-based or corrupted.');
    }

    // Extract structured information
    const extractedInfo = extractAllInfo(extractionResult.text);
    const candidateInfo = getBestCandidateInfo(extractedInfo);

    return {
      success: true,
      candidate: candidateInfo,
      rawText: extractionResult.text,
      extractedInfo: extractedInfo,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        pageCount: extractionResult.pageCount,
        extractionMethod: extractionResult.fallback ? 'fallback' : 'pdfjs',
        ...extractionResult.metadata
      },
      pages: extractionResult.pages
    };

  } catch (error) {
    console.error('PDF resume parsing error:', error);
    return {
      success: false,
      error: error.message,
      candidate: { name: '', email: '', phone: '' },
      rawText: '',
      extractedInfo: null,
      metadata: {
        fileName: file?.name || 'unknown',
        fileSize: file?.size || 0,
        fileType: file?.type || 'unknown'
      }
    };
  }
}

/**
 * Fallback text reader for when PDF.js fails
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result || '');
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Try reading as text (may work for some PDFs with embedded text)
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Check if PDF.js is available
 */
export async function isPDFJSAvailable() {
  try {
    await import('pdfjs-dist/build/pdf');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get PDF parsing capabilities
 */
export async function getPDFParsingCapabilities() {
  const capabilities = {
    pdfjs: await isPDFJSAvailable(),
    fallback: true, // Always available
    supportedTypes: ['application/pdf'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    features: {
      textExtraction: true,
      metadataExtraction: false,
      pageByPageParsing: false
    }
  };

  // Enhanced features with PDF.js
  if (capabilities.pdfjs) {
    capabilities.features.metadataExtraction = true;
    capabilities.features.pageByPageParsing = true;
  }

  return capabilities;
}

/**
 * Validate PDF file before parsing
 */
export function validatePDFFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  if (file.type !== 'application/pdf') {
    errors.push('Invalid file type. Only PDF files are supported.');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 10MB.');
  }

  if (file.size === 0) {
    errors.push('File appears to be empty.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
