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
 * Parse resume document using Docling
 * @param {string} filePath - Path to the uploaded file
 * @returns {Object} Parsed resume data
 */
const parseResume = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    // Try Docling first (Python-based document parser)
    const doclingResult = await parseWithDocling(filePath);
    if (doclingResult) {
      return doclingResult;
    }
  } catch (error) {
    console.log('Docling parsing failed, using fallback parser:', error.message);
  }

  // Fallback to basic parsing
  if (ext === '.pdf') {
    return await parsePDF(filePath);
  } else if (ext === '.docx' || ext === '.doc') {
    return await parseDOCX(filePath);
  }

  throw new Error('Unsupported file format');
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
 * Fallback PDF parser
 */
const parsePDF = async (filePath) => {
  if (!pdfParse || typeof pdfParse !== 'function') {
    // Very basic fallback - just return empty structure
    return createBasicStructure('Unable to parse PDF. Please install pdf-parse package: npm install pdf-parse');
  }

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return extractSections(data.text);
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    return createBasicStructure('Error parsing PDF: ' + error.message);
  }
};

/**
 * Fallback DOCX parser
 */
const parseDOCX = async (filePath) => {
  if (!mammoth) {
    return createBasicStructure('Unable to parse DOCX. Please install mammoth package.');
  }

  const result = await mammoth.extractRawText({ path: filePath });
  return extractSections(result.value);
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
