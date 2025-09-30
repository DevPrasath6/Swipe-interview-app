// DOCX parser using client-side techniques
import { extractAllInfo, getBestCandidateInfo } from '../extractor';

/**
 * Extract text from DOCX file using various techniques
 */
export async function extractTextFromDOCX(file) {
  try {
    // Try different extraction methods
    const methods = [
      () => extractWithJSZip(file),
      () => extractWithXMLParsing(file),
      () => readAsText(file)
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result && result.text && result.text.trim().length > 0) {
          return result;
        }
      } catch (methodError) {
        console.warn('DOCX extraction method failed:', methodError);
        continue;
      }
    }

    throw new Error('All DOCX extraction methods failed');

  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

/**
 * Extract text using JSZip (preferred method for DOCX)
 */
async function extractWithJSZip(file) {
  try {
    // Dynamic import to avoid forcing dependency
    const JSZip = (await import('jszip')).default;

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Get document.xml which contains the main text
    const documentXML = await zip.file('word/document.xml')?.async('string');

    if (!documentXML) {
      throw new Error('Could not find document.xml in DOCX file');
    }

    // Parse XML and extract text
    const text = extractTextFromXML(documentXML);

    // Try to get additional content from other XML files
    const additionalContent = await extractAdditionalContent(zip);

    return {
      success: true,
      text: text + '\n' + additionalContent,
      method: 'jszip',
      metadata: {
        hasMainDocument: !!documentXML,
        additionalFiles: Object.keys(zip.files).length
      }
    };

  } catch (error) {
    console.warn('JSZip extraction failed:', error);
    throw error;
  }
}

/**
 * Extract additional content from DOCX (headers, footers, etc.)
 */
async function extractAdditionalContent(zip) {
  const additionalText = [];

  // Common DOCX content files
  const contentFiles = [
    'word/header1.xml',
    'word/header2.xml',
    'word/header3.xml',
    'word/footer1.xml',
    'word/footer2.xml',
    'word/footer3.xml',
    'word/comments.xml',
    'word/footnotes.xml',
    'word/endnotes.xml'
  ];

  for (const fileName of contentFiles) {
    try {
      const xmlContent = await zip.file(fileName)?.async('string');
      if (xmlContent) {
        const text = extractTextFromXML(xmlContent);
        if (text.trim().length > 0) {
          additionalText.push(text);
        }
      }
    } catch (error) {
      // Ignore errors for optional content
      continue;
    }
  }

  return additionalText.join('\n');
}

/**
 * Extract text from XML content
 */
function extractTextFromXML(xmlString) {
  try {
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing error');
    }

    // Extract text from various XML elements
    const textNodes = xmlDoc.querySelectorAll('w\\:t, t');
    const textParts = [];

    textNodes.forEach(node => {
      const text = node.textContent.trim();
      if (text) {
        textParts.push(text);
      }
    });

    // Also try to get text from paragraph and run elements
    const paragraphs = xmlDoc.querySelectorAll('w\\:p, p');
    paragraphs.forEach(para => {
      const paraText = para.textContent.trim();
      if (paraText && !textParts.includes(paraText)) {
        textParts.push(paraText);
      }
    });

    return textParts.join(' ').replace(/\s+/g, ' ').trim();

  } catch (error) {
    console.warn('XML text extraction failed:', error);

    // Fallback: use regex to extract text between tags
    return xmlString
      .replace(/<[^>]*>/g, ' ') // Remove all XML tags
      .replace(/&[^;]+;/g, ' ') // Remove XML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}

/**
 * Extract text using basic XML parsing (fallback)
 */
async function extractWithXMLParsing(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);

    // Look for XML-like content
    if (!text.includes('<') || !text.includes('/>')) {
      throw new Error('Does not appear to be valid XML');
    }

    // Extract text content using regex
    const extractedText = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      text: extractedText,
      method: 'xml-parsing',
      metadata: {
        originalLength: text.length,
        extractedLength: extractedText.length
      }
    };

  } catch (error) {
    console.warn('XML parsing extraction failed:', error);
    throw error;
  }
}

/**
 * Read file as text (basic fallback)
 */
function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result || '';

      // Clean up the text
      const cleanText = text
        .replace(/[^\w\s@.-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      resolve({
        success: true,
        text: cleanText,
        method: 'text-reader',
        metadata: {
          originalLength: text.length,
          cleanedLength: cleanText.length
        }
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file as text'));
    };

    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Parse DOCX resume and extract candidate information
 */
export async function parseDOCXResume(file) {
  try {
    // Validate file type
    if (!file || !isValidDOCXFile(file)) {
      throw new Error('Invalid file type. Please upload a DOCX file.');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload a file smaller than 10MB.');
    }

    // Extract text from DOCX
    const extractionResult = await extractTextFromDOCX(file);

    if (!extractionResult.text || extractionResult.text.trim().length === 0) {
      throw new Error('Could not extract text from DOCX. The file might be corrupted or empty.');
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
        extractionMethod: extractionResult.method,
        ...extractionResult.metadata
      }
    };

  } catch (error) {
    console.error('DOCX resume parsing error:', error);
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
 * Check if JSZip is available for advanced DOCX parsing
 */
export async function isJSZipAvailable() {
  try {
    await import('jszip');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get DOCX parsing capabilities
 */
export async function getDOCXParsingCapabilities() {
  const capabilities = {
    jszip: await isJSZipAvailable(),
    xmlParsing: true, // Always available in browsers
    textReader: true, // Always available
    supportedTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.docx'
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    features: {
      textExtraction: true,
      headerFooterExtraction: false,
      advancedFormatting: false
    }
  };

  // Enhanced features with JSZip
  if (capabilities.jszip) {
    capabilities.features.headerFooterExtraction = true;
    capabilities.features.advancedFormatting = true;
  }

  return capabilities;
}

/**
 * Check if file is a valid DOCX file
 */
function isValidDOCXFile(file) {
  return (
    file &&
    (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
     file.name?.toLowerCase().endsWith('.docx'))
  );
}

/**
 * Validate DOCX file before parsing
 */
export function validateDOCXFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  if (!isValidDOCXFile(file)) {
    errors.push('Invalid file type. Only DOCX files are supported.');
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
