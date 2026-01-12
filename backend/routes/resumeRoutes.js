/**
 * Resume Routes
 */

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const resumeUploadController = require('../controllers/resumeUploadController');
const aiEnhanceController = require('../controllers/aiEnhanceController');
const pdfController = require('../controllers/pdfController');
const { handleUpload } = require('../utils/fileUpload');

// ============ EXISTING ROUTES ============

// POST /api/resume/save - Save resume data
router.post('/save', resumeController.saveResume);

// POST /api/resume/generate - Generate complete resume
router.post('/generate', resumeController.generateResume);

// POST /api/resume/preview - Preview resume without generating
router.post('/preview', resumeController.previewResume);

// POST /api/resume/enhance-summary - Enhance summary using LLM
router.post('/enhance-summary', resumeController.enhanceSummary);

// POST /api/resume/enhance-project-description - Enhance project description using LLM
router.post('/enhance-project-description', resumeController.enhanceProjectDescription);

// POST /api/resume/enhance-internship-description - Enhance internship description using LLM
router.post('/enhance-internship-description', resumeController.enhanceInternshipDescription);

// POST /api/resume/enhance-custom-content - Enhance custom section content using LLM
router.post('/enhance-custom-content', resumeController.enhanceCustomContent);

// GET /api/resume/download/:id - Download generated resume
router.get('/download/:id', resumeController.downloadResume);

// ============ NEW UPLOAD & EDIT ROUTES ============

// POST /api/resume/upload - Upload and parse resume file
router.post('/upload', handleUpload, resumeUploadController.uploadResume);

// GET /api/resume/upload/status - Check upload endpoint status
router.get('/upload/status', resumeUploadController.getUploadStatus);

// POST /api/resume/enhance - Enhance content with AI
router.post('/enhance', aiEnhanceController.enhanceContent);

// POST /api/resume/enhance-batch - Batch enhance multiple sections
router.post('/enhance-batch', aiEnhanceController.enhanceBatch);

// POST /api/resume/download-pdf - Generate and download PDF
router.post('/download-pdf', pdfController.downloadResume);

// GET /api/resume/templates - Get available templates
router.get('/templates', pdfController.getTemplates);

// POST /api/resume/preview-pdf - Preview PDF configuration
router.post('/preview-pdf', pdfController.previewPDF);

module.exports = router;
