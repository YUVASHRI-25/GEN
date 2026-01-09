/**
 * Resume Routes
 */

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

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

module.exports = router;
