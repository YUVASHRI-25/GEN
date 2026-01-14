/**
 * Layout Preservation Controller
 * Handles PDF to HTML conversion with layout preservation
 */

const layoutPreservationService = require('../services/layoutPreservationService');
const doclingService = require('../services/doclingService');
const { cleanupFile } = require('../utils/fileUpload');

/**
 * Convert PDF to layout-preserving HTML
 * POST /api/resume/convert-layout
 */
const convertToLayoutHTML = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Only PDFs are supported for layout preservation
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      return res.status(400).json({
        success: false,
        message: 'Layout preservation only supports PDF files'
      });
    }

    console.log('📐 Converting PDF with layout preservation:', req.file.originalname);

    // Convert PDF to HTML with exact positioning
    const htmlResult = await layoutPreservationService.convertToHTML(filePath);

    // Optionally get semantic data from Docling
    let semanticData = null;
    try {
      semanticData = await doclingService.parseResume(filePath);
    } catch (e) {
      console.warn('Semantic parsing skipped:', e.message);
    }

    // Merge results
    const result = layoutPreservationService.mergeWithParsedData(htmlResult, semanticData);

    console.log('✅ Layout preserved:', {
      pages: result.pageCount,
      layout: result.layout,
      sections: result.sections.length
    });

    res.json({
      success: true,
      message: 'PDF converted with layout preserved',
      data: result
    });

  } catch (error) {
    console.error('Layout conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert PDF with layout preservation',
      error: error.message
    });
  } finally {
    if (filePath) {
      cleanupFile(filePath);
    }
  }
};

/**
 * Get just the HTML preview (no semantic parsing)
 * POST /api/resume/preview-layout
 */
const previewLayout = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      return res.status(400).json({
        success: false,
        message: 'Layout preview only supports PDF files'
      });
    }

    console.log('👁️ Generating layout preview:', req.file.originalname);

    const htmlResult = await layoutPreservationService.convertToHTML(filePath);

    // Wrap with responsive container
    const responsiveHtml = layoutPreservationService.wrapWithResponsive(
      htmlResult.html,
      htmlResult.dimensions,
      req.body.scale || 1
    );

    res.json({
      success: true,
      html: responsiveHtml,
      layout: htmlResult.layout,
      pageCount: htmlResult.pageCount,
      dimensions: htmlResult.dimensions
    });

  } catch (error) {
    console.error('Layout preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate layout preview',
      error: error.message
    });
  } finally {
    if (filePath) {
      cleanupFile(filePath);
    }
  }
};

/**
 * Analyze layout structure without full conversion
 * POST /api/resume/analyze-layout
 */
const analyzeLayout = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('🔍 Analyzing layout:', req.file.originalname);

    const htmlResult = await layoutPreservationService.convertToHTML(filePath);
    const sections = layoutPreservationService.extractSections(htmlResult);

    res.json({
      success: true,
      layout: htmlResult.layout,
      pageCount: htmlResult.pageCount,
      dimensions: htmlResult.dimensions,
      sections: sections.map(s => ({
        heading: s.heading,
        column: s.column,
        contentLength: s.content.length
      }))
    });

  } catch (error) {
    console.error('Layout analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze layout',
      error: error.message
    });
  } finally {
    if (filePath) {
      cleanupFile(filePath);
    }
  }
};

module.exports = {
  convertToLayoutHTML,
  previewLayout,
  analyzeLayout
};
