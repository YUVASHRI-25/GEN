const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

/**
 * Extract text from PDF file
 * @param {Buffer} fileBuffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file
 * @param {Buffer} fileBuffer - The DOCX file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromDOCX(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

/**
 * Extract text from uploaded document based on file type
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromDocument(fileBuffer, mimeType) {
  if (!fileBuffer) {
    throw new Error('File buffer is required');
  }

  switch (mimeType) {
    case 'application/pdf':
      return await extractTextFromPDF(fileBuffer);
    
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return await extractTextFromDOCX(fileBuffer);
    
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Validate file type
 * @param {string} mimeType - The MIME type to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidFileType(mimeType) {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  return validTypes.includes(mimeType);
}

/**
 * Validate file size (max 10MB)
 * @param {number} fileSize - The file size in bytes
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidFileSize(fileSize) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return fileSize <= maxSize;
}

module.exports = {
  extractTextFromDocument,
  extractTextFromPDF,
  extractTextFromDOCX,
  isValidFileType,
  isValidFileSize
};
