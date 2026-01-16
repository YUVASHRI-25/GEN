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
 * Improved to handle Canva templates and complex layouts
 * 
 * @param {Object} layoutData - Raw layout data from converter
 * @returns {Object} Structured sections
 */
const extractSections = (layoutData) => {
  const sections = [];
  
  // Section heading patterns - expanded for better matching
  const sectionPatterns = [
    { pattern: /^(career\s*)?objective$/i, type: 'summary' },
    { pattern: /^(professional\s*)?(summary|profile|about(\s*me)?|overview)$/i, type: 'summary' },
    { pattern: /^education(al)?(\s*(details|background|history))?$/i, type: 'education' },
    { pattern: /^academic(\s*(qualification|background))?s?$/i, type: 'education' },
    { pattern: /^(work\s*|professional\s*)?(experience|employment|history|career)$/i, type: 'experience' },
    { pattern: /^intern(ship)?s?(\s*(experience))?$/i, type: 'internship' },
    { pattern: /^project(s)?(\s*(experience|work|details))?$/i, type: 'projects' },
    { pattern: /^(technical\s*|key\s*|core\s*)?(skill|expertise|competenc|proficienc)(y|ies|s)?$/i, type: 'skills' },
    { pattern: /^areas?\s*(of\s*)?(interest|expertise)$/i, type: 'skills' },
    { pattern: /^certif(icate|ication)s?(\s*(&|and)\s*credentials?)?$/i, type: 'certifications' },
    { pattern: /^(credential|license)s?$/i, type: 'certifications' },
    { pattern: /^(key\s*)?(achieve|accomplish)ments?$/i, type: 'achievements' },
    { pattern: /^(award|honor|recognition)s?$/i, type: 'achievements' },
    { pattern: /^languages?(\s*(known|spoken))?$/i, type: 'languages' },
    { pattern: /^(hobby|hobbies|interest|activities)$/i, type: 'hobbies' },
    { pattern: /^(extra[\s-]?curricular|co[\s-]?curricular)(\s*activities)?$/i, type: 'hobbies' },
    { pattern: /^contact(\s*(info(rmation)?|details))?$/i, type: 'contact' },
    { pattern: /^personal(\s*(info(rmation)?|details))?$/i, type: 'contact' },
    { pattern: /^reference(s)?$/i, type: 'references' },
    { pattern: /^publication(s)?$/i, type: 'publications' },
    { pattern: /^(research|paper)s?$/i, type: 'publications' },
    { pattern: /^(volunteer|community)(\s*(work|service|experience))?$/i, type: 'volunteer' },
    { pattern: /^(social\s*)?(link|profile)s?$/i, type: 'links' }
  ];
  
  // Keywords that indicate a heading even without special styling
  const headingKeywords = [
    'objective', 'summary', 'profile', 'about', 'education', 'experience',
    'skills', 'projects', 'internship', 'certifications', 'achievements',
    'languages', 'hobbies', 'interests', 'contact', 'references', 
    'publications', 'volunteer', 'areas of interest', 'career objective',
    'education details', 'project experience', 'work experience'
  ];
  
  const detectSectionType = (heading) => {
    const cleanHeading = heading.trim();
    for (const { pattern, type } of sectionPatterns) {
      if (pattern.test(cleanHeading)) return type;
    }
    return 'other';
  };
  
  /**
   * Check if text is likely a section heading
   * Uses multiple signals: font size, boldness, keywords, and text length
   */
  const isLikelyHeading = (elem, avgFontSize, pageWidth) => {
    const text = elem.text?.trim().toLowerCase() || '';
    
    // Short text is more likely to be a heading (< 50 chars)
    const isShortText = text.length < 50 && text.length > 1;
    
    // Check if text matches known heading keywords
    const matchesKeyword = headingKeywords.some(keyword => 
      text === keyword || 
      text.replace(/[:\-_]/g, ' ').trim() === keyword ||
      text.startsWith(keyword + ' ') ||
      text.endsWith(' ' + keyword)
    );
    
    // Font-based detection (larger than average or bold)
    const isFontHeading = elem.font_size >= avgFontSize * 1.1 || elem.is_bold;
    
    // All-caps text is often a heading in Canva templates
    const isAllCaps = elem.text === elem.text?.toUpperCase() && /[A-Z]/.test(elem.text);
    
    // Combined logic: keyword match OR (short + styled)
    return matchesKeyword || (isShortText && (isFontHeading || isAllCaps));
  };
  
  for (const page of layoutData.pages || []) {
    const textElements = page.elements?.text || [];
    if (!textElements.length) continue;
    
    const pageWidth = page.width || 612;
    const pageHeight = page.height || 792;
    
    // Calculate average font size for relative comparison
    const avgFontSize = textElements.reduce((sum, e) => sum + (e.font_size || 12), 0) / textElements.length;
    
    // Detect two-column layout
    const midpoint = pageWidth / 2;
    const leftElements = textElements.filter(e => e.x + (e.width || 0) / 2 < midpoint);
    const rightElements = textElements.filter(e => e.x + (e.width || 0) / 2 >= midpoint);
    const isTwoColumn = leftElements.length > 5 && rightElements.length > 5;
    
    // Process elements - if two-column, process each column separately
    const processColumn = (elements, columnName) => {
      // Sort by Y position (top to bottom)
      const sorted = [...elements].sort((a, b) => a.y - b.y);
      
      let currentSection = null;
      let lastY = -Infinity;
      let lastHeadingY = -Infinity;
      
      for (const elem of sorted) {
        const isHeading = isLikelyHeading(elem, avgFontSize, pageWidth);
        const yGap = elem.y - lastY;
        const headingGap = elem.y - lastHeadingY;
        
        // New section if: heading detected AND (significant gap OR keyword match)
        const isNewSection = isHeading && (yGap > 15 || headingGap > 30 || detectSectionType(elem.text) !== 'other');
        
        if (isNewSection) {
          if (currentSection && (currentSection.content.length > 0 || currentSection.heading)) {
            sections.push(currentSection);
          }
          
          const sectionType = detectSectionType(elem.text);
          currentSection = {
            heading: elem.text?.trim() || '',
            type: sectionType,
            column: columnName,
            content: [],
            y: elem.y,
            pageNum: page.page || 1
          };
          lastHeadingY = elem.y;
        } else if (currentSection) {
          // Add content to current section
          if (elem.text?.trim()) {
            currentSection.content.push(elem.text.trim());
          }
        } else {
          // Content before first heading (name, title, contact info)
          const headerSection = sections.find(s => s.heading === 'Header' && s.column === columnName);
          if (headerSection) {
            if (elem.text?.trim()) {
              headerSection.content.push(elem.text.trim());
            }
          } else {
            sections.push({
              heading: 'Header',
              type: 'header',
              column: columnName,
              content: elem.text?.trim() ? [elem.text.trim()] : [],
              y: elem.y,
              pageNum: page.page || 1
            });
          }
        }
        
        lastY = elem.y;
      }
      
      // Push the last section
      if (currentSection && (currentSection.content.length > 0 || currentSection.heading)) {
        sections.push(currentSection);
      }
    };
    
    if (isTwoColumn) {
      processColumn(leftElements, 'left');
      processColumn(rightElements, 'right');
    } else {
      processColumn(textElements, 'center');
    }
  }
  
  // Post-process: merge duplicate headers, clean up empty sections
  const mergedSections = [];
  const headerSections = sections.filter(s => s.type === 'header');
  const nonHeaderSections = sections.filter(s => s.type !== 'header');
  
  // Merge all header sections into one
  if (headerSections.length > 0) {
    const mergedHeader = {
      heading: 'Header',
      type: 'header',
      column: 'center',
      content: headerSections.flatMap(h => h.content),
      y: Math.min(...headerSections.map(h => h.y)),
      pageNum: headerSections[0].pageNum
    };
    mergedSections.push(mergedHeader);
  }
  
  // Add non-header sections (filter out empty ones)
  for (const section of nonHeaderSections) {
    if (section.heading || section.content.length > 0) {
      mergedSections.push(section);
    }
  }
  
  // Sort by Y position
  mergedSections.sort((a, b) => a.y - b.y);
  
  // Transform content arrays to strings for editing
  return mergedSections.map((section, index) => ({
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
