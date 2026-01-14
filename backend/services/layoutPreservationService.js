/**
 * Layout Preservation Service
 * Converts PDF to HTML while preserving exact visual layout
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

const PDF_TO_HTML_SCRIPT = path.join(__dirname, '../parser/pdf_to_html.py');

/**
 * Convert PDF to layout-preserving HTML
 * Uses PyMuPDF for accurate coordinate extraction
 * 
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} HTML and layout data
 */
const convertToHTML = async (filePath) => {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filePath}`);
  }

  // Check if script exists
  if (!fs.existsSync(PDF_TO_HTML_SCRIPT)) {
    throw new Error(`PDF to HTML script not found: ${PDF_TO_HTML_SCRIPT}`);
  }

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [PDF_TO_HTML_SCRIPT, filePath], {
      maxBuffer: 50 * 1024 * 1024
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (stderr && !stderr.includes('Warning')) {
        console.warn('PDF to HTML stderr:', stderr);
      }

      if (code !== 0) {
        console.error('Python script exited with code:', code);
        console.error('stderr:', stderr);
        reject(new Error(`Python script failed (code ${code}): ${stderr || 'Unknown error'}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        
        if (!result.success) {
          reject(new Error(result.error || 'Conversion failed'));
          return;
        }

        resolve(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', stdout.substring(0, 500));
        reject(new Error(`Failed to parse conversion result: ${parseError.message}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python: ${error.message}`));
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Conversion timed out after 2 minutes'));
    }, 120000);
  });
};

/**
 * Extract structured sections from layout data
 * Groups text elements into logical sections
 * 
 * @param {Object} layoutData - Raw layout data from converter
 * @returns {Object} Structured sections
 */
const extractSections = (layoutData) => {
  const sections = [];
  
  // Section heading patterns
  const sectionPatterns = [
    { pattern: /summary|profile|about|objective/i, type: 'summary' },
    { pattern: /education|academic|qualification/i, type: 'education' },
    { pattern: /experience|work|employment|career/i, type: 'experience' },
    { pattern: /intern/i, type: 'internship' },
    { pattern: /project/i, type: 'projects' },
    { pattern: /skill|technical|expertise|competenc/i, type: 'skills' },
    { pattern: /certif|credential|license/i, type: 'certifications' },
    { pattern: /achieve|award|honor|recognition/i, type: 'achievements' },
    { pattern: /language/i, type: 'languages' },
    { pattern: /hobby|interest|activit/i, type: 'hobbies' },
    { pattern: /contact|email|phone|address/i, type: 'contact' }
  ];
  
  const detectSectionType = (heading) => {
    for (const { pattern, type } of sectionPatterns) {
      if (pattern.test(heading)) return type;
    }
    return 'other';
  };
  
  for (const page of layoutData.pages || []) {
    const textElements = page.elements?.text || [];
    
    // Sort by Y position (top to bottom)
    const sorted = [...textElements].sort((a, b) => a.y - b.y);
    
    let currentSection = null;
    let lastY = -Infinity;
    
    for (const elem of sorted) {
      const isHeading = elem.font_size >= 14 || elem.is_bold;
      const isNewSection = isHeading && (elem.y - lastY > 20);
      
      if (isNewSection) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          heading: elem.text,
          type: detectSectionType(elem.text),
          column: elem.x < page.width / 2 ? 'left' : 'right',
          content: [],
          y: elem.y,
          pageNum: page.page || 1
        };
      } else if (currentSection) {
        currentSection.content.push(elem.text);
      } else {
        // Content before first heading (name, title, etc.)
        if (!sections.length || sections[sections.length - 1].heading !== 'Header') {
          sections.push({
            heading: 'Header',
            type: 'header',
            column: 'center',
            content: [elem.text],
            y: elem.y,
            pageNum: page.page || 1
          });
        } else {
          sections[sections.length - 1].content.push(elem.text);
        }
      }
      
      lastY = elem.y;
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
  }
  
  // Transform content arrays to strings for editing
  return sections.map((section, index) => ({
    id: `section-${index}`,
    heading: section.heading,
    type: section.type,
    content: section.content.join('\n'),
    column: section.column,
    originalY: section.y,
    pageNum: section.pageNum
  }));
};

/**
 * Generate responsive wrapper HTML
 * Scales the absolute-positioned content to fit container
 * 
 * @param {string} innerHtml - The converted HTML
 * @param {Object} dimensions - Original PDF dimensions
 * @param {number} scale - Scale factor (default 1)
 * @returns {string} Wrapped HTML
 */
const wrapWithResponsive = (innerHtml, dimensions, scale = 1) => {
  return `
<div class="layout-preview-wrapper" style="
  max-width: 100%;
  overflow-x: auto;
  background: #f0f0f0;
  padding: 20px;
">
  <div class="layout-preview-scaler" style="
    transform: scale(${scale});
    transform-origin: top center;
    width: ${dimensions.width}px;
    margin: 0 auto;
  ">
    ${innerHtml}
  </div>
</div>`;
};

/**
 * Merge layout HTML with editable data structure
 * Creates a combined view with both visual preview and structured data
 * 
 * @param {Object} htmlResult - From convertToHTML
 * @param {Object} parsedData - From doclingService (optional)
 * @returns {Object} Combined result
 */
const mergeWithParsedData = (htmlResult, parsedData = null) => {
  const result = {
    // Layout-preserving HTML preview
    layoutHtml: htmlResult.html,
    
    // Page metadata
    pageCount: htmlResult.pageCount,
    layout: htmlResult.layout,
    dimensions: htmlResult.dimensions,
    
    // Extracted sections for editing
    sections: extractSections(htmlResult),
    
    // Raw page data for advanced editing
    pages: htmlResult.pages
  };
  
  // If we have parsed semantic data, merge it
  if (parsedData && parsedData.sections) {
    result.semanticSections = parsedData.sections;
    result.contact = parsedData.contact || {};
    result.title = parsedData.title || '';
  }
  
  return result;
};

module.exports = {
  convertToHTML,
  extractSections,
  wrapWithResponsive,
  mergeWithParsedData
};
