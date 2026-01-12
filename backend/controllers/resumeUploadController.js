/**
 * Resume Upload Controller
 * Handles resume file uploads and parsing
 */

const doclingService = require('../services/doclingService');
const { cleanupFile } = require('../utils/fileUpload');

/**
 * Upload and parse resume
 * POST /api/resume/upload
 */
const uploadResume = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📤 Processing uploaded file:', req.file.originalname);

    // Parse the resume using Docling service
    const parsedData = await doclingService.parseResume(filePath);

    console.log('✅ Resume parsed successfully:', parsedData.title);

    // Return parsed resume data
    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        title: parsedData.title,
        sections: parsedData.sections,
        image: parsedData.image,
        originalFilename: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process resume',
      error: error.message
    });
  } finally {
    // Clean up uploaded file after processing
    if (filePath) {
      cleanupFile(filePath);
    }
  }
};

/**
 * Get upload status
 * GET /api/resume/upload/status
 */
const getUploadStatus = async (req, res) => {
  res.json({
    success: true,
    message: 'Upload endpoint is ready',
    supportedFormats: ['pdf', 'docx'],
    maxFileSize: '10MB'
  });
};

module.exports = {
  uploadResume,
  getUploadStatus
};
