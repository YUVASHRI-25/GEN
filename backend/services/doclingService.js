/**
 * Docling Service
 * Parses resume documents (PDF/DOCX) and extracts structured data
 * 
 * Uses Docling for document parsing and structure extraction
 * Fallback to basic parsing if Docling is unavailable
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Try to import pdf-parse and mammoth for fallback parsing
let pdfParse = null;
let mammoth = null;

try {
  const pdfParseModule = require('pdf-parse');
  // Handle different pdf-parse versions
  if (typeof pdfParseModule === 'function') {
    // Legacy version - function that takes buffer directly
    pdfParse = pdfParseModule;
  } else if (pdfParseModule.PDFParse) {
    // Newer version exports PDFParse class
    // PDFParse requires {data: buffer} in constructor, then call getText()
    pdfParse = async (dataBuffer) => {
      const parser = new pdfParseModule.PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      await parser.destroy();
      return { text: result.text || '' };
    };
  } else if (pdfParseModule.default) {
    pdfParse = pdfParseModule.default;
  }
} catch (e) {
  console.log('pdf-parse not available, will use Docling or basic parsing');
}

try {
  mammoth = require('mammoth');
} catch (e) {
  console.log('mammoth not available, will use Docling or basic parsing');
}

/**
 * Default styling for different resume types
 */
const DEFAULT_STYLES = {
  classic: {
    fontFamily: 'Times New Roman, serif',
    fontSize: '11pt',
    headingFont: 'Times New Roman, serif',
    headingSize: '14pt',
    primaryColor: '#000000',
    secondaryColor: '#333333',
    accentColor: '#000000',
    layout: 'single-column',
    lineHeight: '1.4'
  },
  modern: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '10pt',
    headingFont: 'Arial, Helvetica, sans-serif',
    headingSize: '13pt',
    primaryColor: '#2c3e50',
    secondaryColor: '#34495e',
    accentColor: '#3498db',
    layout: 'single-column',
    lineHeight: '1.5'
  },
  professional: {
    fontFamily: 'Calibri, sans-serif',
    fontSize: '11pt',
    headingFont: 'Calibri, sans-serif',
    headingSize: '14pt',
    primaryColor: '#1a1a2e',
    secondaryColor: '#16213e',
    accentColor: '#0f3460',
    layout: 'single-column',
    lineHeight: '1.4'
  },
  creative: {
    fontFamily: 'Georgia, serif',
    fontSize: '10pt',
    headingFont: 'Montserrat, sans-serif',
    headingSize: '14pt',
    primaryColor: '#2d3436',
    secondaryColor: '#636e72',
    accentColor: '#6c5ce7',
    layout: 'two-column',
    lineHeight: '1.6'
  }
};

/**
 * Parse resume document using Docling
 * @param {string} filePath - Path to the uploaded file
 * @returns {Object} Parsed resume data with styling
 */
const parseResume = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let result;

  try {
    // Try Docling first (Python-based document parser)
    const doclingResult = await parseWithDocling(filePath);
    if (doclingResult) {
      result = doclingResult;
    }
  } catch (error) {
    console.log('Docling parsing failed, using fallback parser:', error.message);
  }

  // Fallback to basic parsing
  if (!result) {
    if (ext === '.pdf') {
      result = await parsePDF(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
      result = await parseDOCX(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  // Store original file as base64 for preview
  try {
    const fileBuffer = fs.readFileSync(filePath);
    result.originalFile = {
      data: fileBuffer.toString('base64'),
      mimeType: ext === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: ext
    };
  } catch (e) {
    console.log('Could not read original file for preview:', e.message);
  }

  return result;
};

/**
 * Parse document using Docling (Python)
 */
const parseWithDocling = async (filePath) => {
  // Create Python script for Docling parsing
  const pythonScript = `
import sys
import json
try:
    from docling.document_converter import DocumentConverter
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
    
    file_path = sys.argv[1]
    
    # Initialize converter
    converter = DocumentConverter()
    
    # Convert document
    result = converter.convert(file_path)
    
    # Extract structured data
    doc = result.document
    
    sections = []
    current_heading = "Personal Information"
    current_content = []
    
    for item in doc.iterate_items():
        if hasattr(item, 'label') and item.label in ['section_header', 'heading']:
            if current_content:
                sections.append({
                    "heading": current_heading,
                    "content": " ".join(current_content)
                })
            current_heading = item.text if hasattr(item, 'text') else str(item)
            current_content = []
        elif hasattr(item, 'text'):
            current_content.append(item.text)
    
    # Add last section
    if current_content:
        sections.append({
            "heading": current_heading,
            "content": " ".join(current_content)
        })
    
    # Extract images if any
    images = []
    for page in doc.pages:
        for image in page.images:
            if hasattr(image, 'image') and image.image:
                import base64
                img_data = base64.b64encode(image.image).decode('utf-8')
                images.append(img_data)
    
    output = {
        "title": sections[0]["heading"] if sections else "Resume",
        "sections": sections,
        "image": images[0] if images else None
    }
    
    print(json.dumps(output))
    
except ImportError:
    print(json.dumps({"error": "Docling not installed"}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

  const tempScriptPath = path.join(__dirname, '../uploads/parse_resume.py');
  
  try {
    fs.writeFileSync(tempScriptPath, pythonScript);
    
    const { stdout, stderr } = await execPromise(`python "${tempScriptPath}" "${filePath}"`, {
      timeout: 60000 // 60 second timeout
    });
    
    const result = JSON.parse(stdout);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } finally {
    // Clean up temp script
    try {
      if (fs.existsSync(tempScriptPath)) {
        fs.unlinkSync(tempScriptPath);
      }
    } catch (e) {}
  }
};

/**
 * Fallback PDF parser with styling detection
 */
const parsePDF = async (filePath) => {
  if (!pdfParse || typeof pdfParse !== 'function') {
    // Very basic fallback - just return empty structure
    return createBasicStructure('Unable to parse PDF. Please install pdf-parse package: npm install pdf-parse');
  }

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const result = extractSections(data.text);
    
    // Detect styling from content patterns
    result.styling = detectStyling(data.text);
    
    return result;
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    return createBasicStructure('Error parsing PDF: ' + error.message);
  }
};

/**
 * Fallback DOCX parser with styling extraction
 */
const parseDOCX = async (filePath) => {
  if (!mammoth) {
    return createBasicStructure('Unable to parse DOCX. Please install mammoth package.');
  }

  try {
    // Extract with style information
    const options = {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Title'] => h1.title:fresh",
        "b => strong",
        "i => em"
      ]
    };
    
    const htmlResult = await mammoth.convertToHtml({ path: filePath }, options);
    const textResult = await mammoth.extractRawText({ path: filePath });
    
    const result = extractSections(textResult.value);
    
    // Try to detect styling from HTML output
    result.styling = detectDocxStyling(htmlResult.value);
    result.htmlContent = htmlResult.value;
    
    return result;
  } catch (error) {
    console.error('DOCX parsing error:', error.message);
    const textResult = await mammoth.extractRawText({ path: filePath });
    const result = extractSections(textResult.value);
    result.styling = DEFAULT_STYLES.professional;
    return result;
  }
};

/**
 * Detect styling patterns from text content
 */
const detectStyling = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Analyze content to determine style type
  let styleType = 'professional';
  
  // Check for creative indicators (emojis, special characters, unusual formatting)
  const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(text);
  const hasSpecialBullets = /[•◦▪►]/g.test(text);
  const hasColorIndicators = /#[0-9A-Fa-f]{6}/g.test(text);
  
  if (hasEmojis || hasColorIndicators) {
    styleType = 'creative';
  } else if (hasSpecialBullets) {
    styleType = 'modern';
  }
  
  // Check text density and formatting
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  if (avgLineLength > 80) {
    styleType = 'classic';
  }
  
  // Return detected style with original flag
  return {
    ...DEFAULT_STYLES[styleType],
    detectedType: styleType,
    preserveOriginal: true
  };
};

/**
 * Detect styling from DOCX HTML output
 */
const detectDocxStyling = (html) => {
  let styling = { ...DEFAULT_STYLES.professional };
  
  // Check for heading styles
  if (html.includes('font-weight: bold') || html.includes('<strong>')) {
    styling.headingWeight = 'bold';
  }
  
  // Check for colors in inline styles
  const colorMatch = html.match(/color:\s*#([0-9A-Fa-f]{6})/i);
  if (colorMatch) {
    styling.primaryColor = `#${colorMatch[1]}`;
  }
  
  // Check for font families
  const fontMatch = html.match(/font-family:\s*([^;]+)/i);
  if (fontMatch) {
    styling.fontFamily = fontMatch[1].trim();
  }
  
  styling.detectedType = 'original';
  styling.preserveOriginal = true;
  
  return styling;
};

/**
 * Extract sections from raw text
 */
const extractSections = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  const sections = [];
  
  // Common resume section headings
  const sectionPatterns = [
    /^(personal\s*(information|details)?|contact(\s*info(rmation)?)?)/i,
    /^(professional\s*)?summary/i,
    /^(career\s*)?objective/i,
    /^(work\s*)?experience/i,
    /^education/i,
    /^skills/i,
    /^(technical\s*)?skills/i,
    /^projects?/i,
    /^certifications?/i,
    /^achievements?/i,
    /^(hobbies|interests)/i,
    /^languages?/i,
    /^references?/i,
    /^internships?/i,
    /^training/i,
    /^publications?/i,
    /^awards?/i
  ];

  let currentSection = {
    heading: 'Personal Information',
    content: ''
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this line is a section heading
    const isHeading = sectionPatterns.some(pattern => pattern.test(trimmedLine)) ||
                      (trimmedLine.length < 50 && trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 2);

    if (isHeading) {
      // Save previous section
      if (currentSection.content.trim()) {
        sections.push({ ...currentSection });
      }
      // Start new section
      currentSection = {
        heading: formatHeading(trimmedLine),
        content: ''
      };
    } else {
      // Add to current section content
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    }
  }

  // Add last section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  // If no sections found, create basic structure
  if (sections.length === 0) {
    sections.push({
      heading: 'Resume Content',
      content: text.trim()
    });
  }

  return {
    title: extractTitle(sections),
    sections: sections,
    image: null
  };
};

/**
 * Format section heading
 */
const formatHeading = (text) => {
  // Capitalize first letter of each word
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Extract resume title (usually the name)
 */
const extractTitle = (sections) => {
  if (sections.length > 0) {
    const firstContent = sections[0].content;
    const firstLine = firstContent.split('\n')[0];
    // Return first line if it looks like a name (no special characters, reasonable length)
    if (firstLine && firstLine.length < 50 && /^[a-zA-Z\s.]+$/.test(firstLine.trim())) {
      return firstLine.trim();
    }
  }
  return 'Resume';
};

/**
 * Create basic structure for error cases
 */
const createBasicStructure = (message) => {
  return {
    title: 'Resume',
    sections: [
      {
        heading: 'Notice',
        content: message
      },
      {
        heading: 'Personal Information',
        content: ''
      },
      {
        heading: 'Summary',
        content: ''
      },
      {
        heading: 'Experience',
        content: ''
      },
      {
        heading: 'Education',
        content: ''
      },
      {
        heading: 'Skills',
        content: ''
      }
    ],
    image: null
  };
};

/**
 * Extract images from document (for profile photos)
 */
const extractImages = async (filePath) => {
  // This would require additional libraries for proper image extraction
  // For now, return null - can be enhanced later
  return null;
};

module.exports = {
  parseResume,
  extractSections,
  extractImages
};
