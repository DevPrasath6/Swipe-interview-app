// File service for handling file operations
import { parsePDFResume, validatePDFFile } from '../utils/parser/pdfParser';
import { parseDOCXResume, validateDOCXFile } from '../utils/parser/docxParser';

/**
 * Supported file types for resume upload
 */
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Parse resume file and extract candidate information
 */
export async function parseResumeFile(file) {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Parse based on file type
    switch (file.type) {
      case SUPPORTED_FILE_TYPES.PDF:
        return await parsePDFResume(file);

      case SUPPORTED_FILE_TYPES.DOCX:
        return await parseDOCXResume(file);

      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }

  } catch (error) {
    console.error('File parsing error:', error);
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
 * Validate uploaded file
 */
export function validateFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  // Check file type
  const supportedTypes = Object.values(SUPPORTED_FILE_TYPES);
  const isDocx = file.name?.toLowerCase().endsWith('.docx');

  if (!supportedTypes.includes(file.type) && !isDocx) {
    errors.push('Unsupported file type. Please upload a PDF or DOCX file.');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    errors.push(`File size too large. Maximum size is ${maxSizeMB}MB.`);
  }

  if (file.size === 0) {
    errors.push('File appears to be empty.');
  }

  // Specific validations based on file type
  if (file.type === SUPPORTED_FILE_TYPES.PDF) {
    const pdfValidation = validatePDFFile(file);
    if (!pdfValidation.isValid) {
      errors.push(...pdfValidation.errors);
    }
  } else if (file.type === SUPPORTED_FILE_TYPES.DOCX || isDocx) {
    const docxValidation = validateDOCXFile(file);
    if (!docxValidation.isValid) {
      errors.push(...docxValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Read file as data URL (for preview purposes)
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.readAsDataURL(file);
  });
}

/**
 * Read file as text
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Read file as array buffer
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Get file type information
 */
export function getFileTypeInfo(file) {
  const extension = file.name?.split('.').pop()?.toLowerCase() || '';

  return {
    extension,
    mimeType: file.type,
    isSupported: validateFile(file).isValid,
    category: getFileCategory(file.type, extension),
    icon: getFileIcon(file.type, extension)
  };
}

/**
 * Get file category
 */
function getFileCategory(mimeType, extension) {
  if (mimeType === SUPPORTED_FILE_TYPES.PDF || extension === 'pdf') {
    return 'pdf';
  }

  if (mimeType === SUPPORTED_FILE_TYPES.DOCX || extension === 'docx') {
    return 'docx';
  }

  return 'other';
}

/**
 * Get file icon based on type
 */
function getFileIcon(mimeType, extension) {
  switch (getFileCategory(mimeType, extension)) {
    case 'pdf':
      return '📄';
    case 'docx':
      return '📝';
    default:
      return '📎';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(file) {
  const validation = validateFile(file);
  return validation.isValid;
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions() {
  return ['.pdf', '.docx'];
}

/**
 * Get supported MIME types
 */
export function getSupportedMimeTypes() {
  return Object.values(SUPPORTED_FILE_TYPES);
}

/**
 * Create file input accept string
 */
export function getFileInputAccept() {
  return getSupportedMimeTypes().join(',') + ',.pdf,.docx';
}

/**
 * Handle file drop event
 */
export function handleFileDrop(event) {
  event.preventDefault();

  const files = Array.from(event.dataTransfer?.files || []);
  const validFiles = files.filter(file => isFileTypeSupported(file));

  return {
    allFiles: files,
    validFiles: validFiles,
    hasInvalidFiles: files.length > validFiles.length,
    invalidFiles: files.filter(file => !isFileTypeSupported(file))
  };
}

/**
 * Handle file selection event
 */
export function handleFileSelection(event) {
  const files = Array.from(event.target?.files || []);
  const validFiles = files.filter(file => isFileTypeSupported(file));

  return {
    allFiles: files,
    validFiles: validFiles,
    hasInvalidFiles: files.length > validFiles.length,
    invalidFiles: files.filter(file => !isFileTypeSupported(file))
  };
}

/**
 * Generate unique file ID
 */
export function generateFileId(file) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const fileName = file.name.replace(/[^a-zA-Z0-9]/g, '');

  return `${fileName}_${timestamp}_${random}`;
}

/**
 * Create file metadata object
 */
export function createFileMetadata(file, fileId = null) {
  return {
    id: fileId || generateFileId(file),
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    uploadedAt: Date.now(),
    ...getFileTypeInfo(file)
  };
}
