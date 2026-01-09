/**
 * Resume Controller
 * Handles resume generation and processing
 */

const llmService = require('../services/llmService');
const templateService = require('../services/templateService');
const pdfGenerator = require('../utils/pdfGenerator');

/**
 * Generate resume from user data
 * Main endpoint that processes resume data
 */
/**
 * Save resume data
 */
const saveResume = async (req, res) => {
  try {
    const resumeData = req.body;
    
    // In a real application, you would save this to a database
    // For now, we'll just log and return success
    console.log('📝 Saving resume data:', resumeData);
    
    res.json({
      success: true,
      message: 'Resume data saved successfully',
      data: resumeData
    });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save resume data',
      error: error.message
    });
  }
};

/**
 * Generate resume from user data
 */
const generateResume = async (req, res) => {
  try {
    const resumeData = req.body;

    // Validate required fields
    if (!resumeData.contact || !resumeData.contact.name) {
      return res.status(400).json({
        success: false,
        message: 'Contact information with name is required'
      });
    }

    console.log('📄 Generating resume for:', resumeData.contact.name);

    // Step 1: Enhance resume data using LLM
    const enhancedData = await llmService.enhanceResumeData(resumeData);

    // Step 2: Apply ATS template
    const formattedResume = templateService.applyTemplate(enhancedData);

    // Step 3: Generate PDF
    const pdfBuffer = await pdfGenerator.generatePDF(formattedResume);

    res.json({
      success: true,
      message: 'Resume generated successfully',
      data: {
        formattedResume,
        downloadUrl: `/api/resume/download/${Date.now()}`
      }
    });
  } catch (error) {
    console.error('Resume generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate resume',
      error: error.message
    });
  }
};

/**
 * Preview resume without generating PDF
 */
const previewResume = async (req, res) => {
  try {
    const resumeData = req.body;

    // Enhance data with LLM
    const enhancedData = await llmService.enhanceResumeData(resumeData);

    // Apply template formatting
    const formattedResume = templateService.applyTemplate(enhancedData);

    res.json({
      success: true,
      preview: formattedResume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to preview resume',
      error: error.message
    });
  }
};

/**
 * Enhance summary using LLM
 */
const enhanceSummary = async (req, res) => {
  try {
    const { summary, skills, education } = req.body;

    const enhancedSummary = await llmService.generateProfessionalSummary({
      summary,
      skills,
      education
    });

    res.json({
      success: true,
      enhancedSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enhance summary',
      error: error.message
    });
  }
};

/**
 * Download generated resume
 */
const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;

    // In production, retrieve saved resume data
    res.json({
      success: true,
      message: `Download resume ${id} in ${format} format`,
      // In production, send actual file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: error.message
    });
  }
};

/**
 * Enhance project description using LLM
 */
const enhanceProjectDescription = async (req, res) => {
  try {
    const { description, projectName, technologies } = req.body;

    const enhancedDescription = await llmService.enhanceProjectDescription({
      description,
      projectName,
      technologies
    });

    res.json({
      success: true,
      enhancedDescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enhance project description',
      error: error.message
    });
  }
};

/**
 * Enhance internship description using LLM
 */
const enhanceInternshipDescription = async (req, res) => {
  try {
    const { description, title, company } = req.body;

    const enhancedDescription = await llmService.enhanceInternshipDescription({
      description,
      title,
      company
    });

    res.json({
      success: true,
      enhancedDescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enhance internship description',
      error: error.message
    });
  }
};

/**
 * Enhance custom section content using LLM
 */
const enhanceCustomContent = async (req, res) => {
  try {
    const { content, title } = req.body;

    const enhancedContent = await llmService.enhanceCustomContent({
      content,
      title
    });

    res.json({
      success: true,
      enhancedContent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enhance custom content',
      error: error.message
    });
  }
};

module.exports = {
  saveResume,
  generateResume,
  previewResume,
  enhanceSummary,
  enhanceProjectDescription,
  enhanceInternshipDescription,
  enhanceCustomContent,
  downloadResume
};
