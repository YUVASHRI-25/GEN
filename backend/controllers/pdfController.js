/**
 * PDF Controller
 * Handles PDF generation and download for resumes
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Templates directory
const templatesDir = path.join(__dirname, '../templates');

/**
 * Generate and download PDF resume
 * POST /api/resume/download
 */
const downloadResume = async (req, res) => {
  try {
    const { resumeData, templateId, customStyling } = req.body;

    if (!resumeData || !resumeData.sections) {
      return res.status(400).json({
        success: false,
        message: 'Resume data with sections is required'
      });
    }

    console.log('📄 Generating PDF with template:', templateId || 'default');

    let template;
    
    // If using original format with custom styling, create template from styling
    if (templateId === 'originalFormat' && customStyling) {
      template = createTemplateFromStyling(customStyling);
      console.log('🎨 Using original document styling');
    } else {
      // Load template configuration
      template = loadTemplate(templateId || 'atsTemplate');
    }

    // Generate PDF buffer
    const pdfBuffer = await generatePDFFromSections(resumeData, template);

    // Set response headers for download
    const filename = `${resumeData.title || 'Resume'}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    console.log('✅ PDF generated and sent successfully');

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
};

/**
 * Create a template configuration from detected styling
 */
const createTemplateFromStyling = (styling) => {
  // Map web fonts to PDF-compatible fonts
  const fontMap = {
    'Times New Roman, serif': 'Times-Roman',
    'Arial, Helvetica, sans-serif': 'Helvetica',
    'Calibri, sans-serif': 'Helvetica',
    'Georgia, serif': 'Times-Roman',
    'Montserrat, sans-serif': 'Helvetica-Bold'
  };

  // Parse font size from styling (e.g., "11pt" -> 11)
  const parseFontSize = (size) => {
    if (!size) return 11;
    const match = size.match(/(\d+)/);
    return match ? parseInt(match[1]) : 11;
  };

  return {
    name: 'Original Format',
    description: 'Preserves the original document styling',
    fonts: {
      heading: fontMap[styling.headingFont] || 'Helvetica-Bold',
      body: fontMap[styling.fontFamily] || 'Helvetica',
      size: {
        name: 24,
        section: parseFontSize(styling.headingSize) || 14,
        body: parseFontSize(styling.fontSize) || 11
      }
    },
    colors: {
      primary: styling.primaryColor || '#000000',
      secondary: styling.secondaryColor || '#333333',
      accent: styling.accentColor || '#000000'
    },
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    },
    layout: styling.layout === 'two-column' ? 'two_column' : 'single_column'
  };
};

/**
 * Get available templates
 * GET /api/resume/templates
 */
const getTemplates = async (req, res) => {
  try {
    const templates = [];
    const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));

    for (const file of templateFiles) {
      const templatePath = path.join(templatesDir, file);
      const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      templates.push({
        id: file.replace('.json', ''),
        name: template.name || file.replace('.json', ''),
        description: template.description || '',
        layout: template.layout || 'single_column'
      });
    }

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

/**
 * Load template configuration
 */
const loadTemplate = (templateId) => {
  try {
    const templatePath = path.join(templatesDir, `${templateId}.json`);
    if (fs.existsSync(templatePath)) {
      return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    }
  } catch (error) {
    console.log('Error loading template, using default');
  }

  // Default template configuration
  return {
    name: 'Default ATS Template',
    layout: 'single_column',
    styling: {
      fontFamily: 'Helvetica',
      fontSize: {
        name: 24,
        sectionTitle: 14,
        body: 11
      },
      margins: {
        top: 50,
        bottom: 50,
        left: 60,
        right: 60
      },
      lineHeight: 1.15,
      colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#1a1a1a'
      }
    }
  };
};

/**
 * Generate PDF from resume sections
 */
const generatePDFFromSections = async (resumeData, template) => {
  return new Promise((resolve, reject) => {
    try {
      const styling = template.styling || {};
      const margins = {
        top: 50,
        bottom: 50,
        left: 60,
        right: 60
      };

      const doc = new PDFDocument({
        size: 'A4',
        margins: margins
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add profile image if exists
      if (resumeData.image) {
        try {
          const imageBuffer = Buffer.from(resumeData.image, 'base64');
          doc.image(imageBuffer, doc.page.width - 120, 50, {
            width: 70,
            height: 70
          });
        } catch (imgError) {
          console.log('Could not add profile image:', imgError.message);
        }
      }

      // Add title (name)
      if (resumeData.title && resumeData.title !== 'Resume') {
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text(resumeData.title, { align: 'center' });
        doc.moveDown(0.5);
      }

      // Add sections
      for (const section of resumeData.sections) {
        addSection(doc, section, styling);
      }

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Add section to PDF document
 */
const addSection = (doc, section, styling) => {
  if (!section.heading && !section.content) return;

  // Skip empty sections
  if (!section.content || !section.content.trim()) return;

  // Add section heading
  if (section.heading) {
    doc.moveDown(0.5);
    
    // Section title
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(section.heading.toUpperCase());

    // Underline
    const startX = doc.page.margins.left;
    const endX = doc.page.width - doc.page.margins.right;
    doc.moveTo(startX, doc.y)
       .lineTo(endX, doc.y)
       .strokeColor('#cccccc')
       .lineWidth(0.5)
       .stroke();

    doc.moveDown(0.3);
  }

  // Add section content
  const content = section.content.trim();
  
  // Check if content has bullet points
  if (content.includes('•') || content.includes('-') || content.includes('*')) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Handle bullet points
        if (/^[•\-*]\s*/.test(trimmedLine)) {
          doc.fontSize(11)
             .font('Helvetica')
             .text(trimmedLine, { indent: 10, lineGap: 2 });
        } else {
          doc.fontSize(11)
             .font('Helvetica')
             .text(trimmedLine, { lineGap: 2 });
        }
      }
    }
  } else {
    // Regular paragraph content
    doc.fontSize(11)
       .font('Helvetica')
       .text(content, {
         align: 'justify',
         lineGap: 2
       });
  }

  doc.moveDown(0.5);
};

/**
 * Preview PDF (returns JSON representation)
 * POST /api/resume/preview-pdf
 */
const previewPDF = async (req, res) => {
  try {
    const { resumeData, templateId } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'Resume data is required'
      });
    }

    const template = loadTemplate(templateId || 'atsTemplate');

    res.json({
      success: true,
      data: {
        template: template.name,
        sections: resumeData.sections?.length || 0,
        estimatedPages: Math.ceil((resumeData.sections?.length || 1) / 5),
        title: resumeData.title
      }
    });

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview PDF',
      error: error.message
    });
  }
};

module.exports = {
  downloadResume,
  getTemplates,
  previewPDF
};
