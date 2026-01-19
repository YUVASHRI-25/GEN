/**
 * LLM Service
 * Handles integration with LLaMA / Mistral for resume enhancement
 * 
 * This service can connect to:
 * - Local LLaMA model (via Ollama)
 * - Mistral API
 * - OpenAI API (fallback)
 */

const axios = require('axios');

// Configuration
const LLM_CONFIG = {
  // Ollama (Local LLaMA/Mistral)
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: process.env.LLM_MODEL || 'mistral', // or 'llama2', 'llama3'

  // Alternative: OpenAI API
  openaiUrl: 'https://api.openai.com/v1/chat/completions',
  openaiKey: process.env.OPENAI_API_KEY
};

/**
 * Generate professional summary using LLM
 */
const generateProfessionalSummary = async (data) => {
  const { summary, skills, education } = data;

  // First try to enhance with LLM
  const prompt = `You are an ATS resume formatter and career advisor.
Generate a professional summary for a first-year engineering student based on the following details.

Current Summary (if any): ${summary || 'Not provided'}
Skills: ${skills?.join(', ') || 'Not provided'}
Education: ${education?.[0]?.degree || 'Engineering student'}

Requirements:
- Keep it concise (2-3 sentences)
- Make it ATS-friendly (use keywords)
- Focus on learning ability and potential
- Use professional language
- Avoid personal pronouns (I, me, my)

Generate ONLY the summary text, no additional explanations.`;

  try {
    const response = await callLLM(prompt);
    if (response && response.trim().length > 20) {
      return response;
    }
  } catch (error) {
    console.log('AI enhancement unavailable, using smart fallback for summary');
  }
  
  // Always generate an enhanced summary using smart fallback
  return generateSmartSummary(data);
};

/**
 * Enhance complete resume data
 */
const enhanceResumeData = async (resumeData) => {
  const enhanced = { ...resumeData };

  try {
    // Enhance summary if provided or generate new one
    if (resumeData.summary || resumeData.skills?.length > 0) {
      enhanced.summary = await generateProfessionalSummary({
        summary: resumeData.summary,
        skills: resumeData.skills,
        education: resumeData.education
      });
    }

    // Format skills into categories
    if (resumeData.skills?.length > 0) {
      enhanced.formattedSkills = await categorizeSkills(resumeData.skills);
    }

    // Enhance internship descriptions
    if (resumeData.internship?.length > 0) {
      enhanced.internship = await enhanceInternshipDescriptions(resumeData.internship);
    }

    return enhanced;
  } catch (error) {
    console.error('Resume enhancement error:', error.message);
    return resumeData; // Return original if enhancement fails
  }
};

/**
 * Categorize skills using LLM
 */
const categorizeSkills = async (skills) => {
  const prompt = `Categorize these skills for an ATS resume:
Skills: ${skills.join(', ')}

Return as JSON with categories:
{
  "programming": [],
  "tools": [],
  "soft_skills": [],
  "other": []
}

Only return valid JSON, no explanations.`;

  try {
    const response = await callLLM(prompt);
    return JSON.parse(response);
  } catch (error) {
    // Fallback: return uncategorized
    return { all: skills };
  }
};

/**
 * Enhance internship descriptions
 */
const enhanceInternshipDescriptions = async (internships) => {
  const enhanced = [];

  for (const internship of internships) {
    if (internship.description) {
      const prompt = `Rewrite this internship description for an ATS resume.
Make it action-oriented with measurable outcomes.

Original: ${internship.description}

Return only the enhanced description (2-3 bullet points).`;

      try {
        const enhancedDesc = await callLLM(prompt);
        enhanced.push({ ...internship, description: enhancedDesc });
      } catch {
        enhanced.push(internship);
      }
    } else {
      enhanced.push(internship);
    }
  }

  return enhanced;
};

/**
 * Enhance project description
 */
const enhanceProjectDescription = async (data) => {
  const { description, projectName, technologies } = data;

  const prompt = `You are an ATS resume formatter and career advisor.
Enhance this project description for a student's resume.

Project Name: ${projectName || 'Project'}
Technologies: ${technologies || 'Not specified'}
Current Description: ${description || 'Not provided'}

Requirements:
- Make it concise and impactful (2-3 sentences)
- Use action verbs and quantifiable achievements if possible
- Make it ATS-friendly with relevant keywords
- Focus on what was built and the technologies used
- Highlight problem-solving and technical skills

Generate ONLY the enhanced description, no additional explanations or formatting.`;

  try {
    const response = await callLLM(prompt);
    if (response && response.trim().length > 20) {
      return response;
    }
  } catch (error) {
    console.log('AI enhancement unavailable, using smart fallback for project description');
  }
  
  // Always return an enhanced version
  return generateSmartProjectDescription(data);
};

/**
 * Enhance single internship description
 */
const enhanceInternshipDescription = async (data) => {
  const { description, title, company } = data;

  const prompt = `You are an ATS resume formatter and career advisor.
Enhance this internship/experience description for a student's resume.

Role: ${title || 'Intern'}
Company: ${company || 'Company'}
Current Description: ${description || 'Not provided'}

Requirements:
- Make it action-oriented and impactful (2-3 sentences)
- Use strong action verbs (Developed, Implemented, Collaborated, etc.)
- Include measurable outcomes where possible
- Make it ATS-friendly with industry keywords
- Focus on responsibilities and achievements
- Emphasize skills and technologies used

Generate ONLY the enhanced description, no additional explanations or formatting.`;

  try {
    const response = await callLLM(prompt);
    if (response && response.trim().length > 20) {
      return response;
    }
  } catch (error) {
    console.log('AI enhancement unavailable, using smart fallback for internship description');
  }
  
  // Always return an enhanced version
  return generateSmartInternshipDescription(data);
};

/**
 * Smart project description generator - enhances original content
 */
const generateSmartProjectDescription = (data) => {
  const { projectName, technologies, description } = data;
  const tech = technologies || '';
  const techArray = tech.split(',').map(t => t.trim()).filter(t => t);
  
  // Action verbs for projects
  const actionVerbs = ['Developed', 'Built', 'Implemented', 'Created', 'Designed', 'Engineered'];
  const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
  
  if (description && description.trim().length > 10) {
    // Enhance the existing description
    let enhanced = description.trim();
    
    // Capitalize first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    
    // Add action verb if not starting with one
    const startsWithAction = /^(Developed|Built|Created|Implemented|Designed|Led|Managed|Collaborated)/i.test(enhanced);
    if (!startsWithAction) {
      enhanced = `${verb} ${enhanced.charAt(0).toLowerCase()}${enhanced.slice(1)}`;
    }
    
    // Add tech stack mention if not present and we have technologies
    if (techArray.length > 0 && !enhanced.toLowerCase().includes(techArray[0].toLowerCase())) {
      enhanced += ` Utilized ${techArray.slice(0, 3).join(', ')} for implementation.`;
    }
    
    // Ensure proper ending
    if (!/[.!]$/.test(enhanced)) {
      enhanced += '.';
    }
    
    return enhanced;
  }

  // Generate from scratch if no description
  const techStr = techArray.length > 0 ? techArray.slice(0, 3).join(', ') : 'modern technologies';
  return `${verb} ${projectName || 'a full-stack application'} using ${techStr}. Implemented core features and functionality, demonstrating strong problem-solving skills and technical proficiency. Gained hands-on experience with industry-standard development practices.`;
};

/**
 * Smart internship description generator - enhances original content
 */
const generateSmartInternshipDescription = (data) => {
  const { title, company, description } = data;
  const role = title || 'Intern';
  const org = company || 'the organization';
  
  // Action verbs for experience
  const actionVerbs = ['Collaborated', 'Contributed', 'Assisted', 'Supported', 'Participated', 'Worked'];
  const impactVerbs = ['improving', 'enhancing', 'streamlining', 'optimizing', 'supporting'];
  const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
  const impact = impactVerbs[Math.floor(Math.random() * impactVerbs.length)];

  if (description && description.trim().length > 10) {
    // Enhance the existing description
    let enhanced = description.trim();
    
    // Capitalize first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    
    // Add action verb if not starting with one
    const startsWithAction = /^(Developed|Built|Created|Implemented|Collaborated|Contributed|Led|Managed|Assisted)/i.test(enhanced);
    if (!startsWithAction) {
      enhanced = `${verb} on ${enhanced.charAt(0).toLowerCase()}${enhanced.slice(1)}`;
    }
    
    // Ensure proper ending
    if (!/[.!]$/.test(enhanced)) {
      enhanced += '.';
    }
    
    // Add professional closing if short
    if (enhanced.length < 100) {
      enhanced += ` Demonstrated strong communication skills and ability to work effectively in a team environment.`;
    }
    
    return enhanced;
  }

  // Generate from scratch if no description
  return `${verb} with cross-functional teams as ${role} at ${org}, ${impact} project deliverables and contributing to key initiatives. Developed professional skills including communication, problem-solving, and time management while gaining hands-on industry experience.`;
};

/**
 * Enhance custom section content
 */
const enhanceCustomContent = async (data) => {
  const { content, title } = data;

  const prompt = `You are an ATS resume formatter and career advisor.
Enhance this custom section content for a student's resume.

Section Title: ${title || 'Custom Section'}
Current Content: ${content || 'Not provided'}

Requirements:
- Make it professional and concise (2-3 sentences or bullet-point style)
- Use clear, impactful language
- Make it relevant and appropriate for a resume
- Focus on achievements, skills, or relevant information
- Keep the tone professional yet engaging

Generate ONLY the enhanced content, no additional explanations or formatting.`;

  try {
    const response = await callLLM(prompt);
    if (response && response.trim().length > 20) {
      return response;
    }
  } catch (error) {
    console.log('AI enhancement unavailable, using smart fallback for custom content');
  }
  
  // Always return an enhanced version
  return generateSmartCustomContent(data);
};

/**
 * Smart custom content generator - enhances original content
 */
const generateSmartCustomContent = (data) => {
  const { title, content } = data;
  const sectionTitle = (title || '').toLowerCase();

  if (content && content.trim().length > 10) {
    // Enhance the existing content
    let enhanced = content.trim();
    
    // Capitalize first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    
    // Ensure proper ending
    if (!/[.!]$/.test(enhanced)) {
      enhanced += '.';
    }
    
    // Clean up multiple spaces
    enhanced = enhanced.replace(/\s+/g, ' ');
    
    return enhanced;
  }

  // Generate based on section type
  if (sectionTitle.includes('hobby') || sectionTitle.includes('interest')) {
    return 'Passionate about continuous learning and exploring new technologies. Enjoy problem-solving challenges and staying updated with industry trends. Active participant in tech communities and coding challenges.';
  }

  if (sectionTitle.includes('achievement') || sectionTitle.includes('award')) {
    return 'Consistently demonstrated strong academic performance and active participation in extracurricular activities. Recognized for dedication to personal and professional growth with notable achievements in academics and projects.';
  }

  if (sectionTitle.includes('volunteer') || sectionTitle.includes('community')) {
    return 'Actively contributed to community service initiatives, developing leadership and teamwork skills through collaborative volunteer projects. Committed to making a positive impact through social responsibility.';
  }

  if (sectionTitle.includes('language')) {
    return 'Proficient in multiple languages, enabling effective communication in diverse environments. Strong written and verbal communication skills.';
  }

  return 'Demonstrated commitment to personal growth and professional development through various activities and experiences. Continuously seeking opportunities to learn and contribute meaningfully.';
};

/**
 * Call LLM API (Ollama/Local)
 */
const callLLM = async (prompt) => {
  try {
    // Try Ollama first (local LLM)
    const response = await axios.post(
      `${LLM_CONFIG.ollamaUrl}/api/generate`,
      {
        model: LLM_CONFIG.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500
        }
      },
      { timeout: 30000 }
    );

    return response.data.response?.trim() || '';
  } catch (ollamaError) {
    console.log('Ollama not available, trying OpenAI fallback...');

    // Fallback to OpenAI if configured and valid
    if (LLM_CONFIG.openaiKey && LLM_CONFIG.openaiKey !== 'your_openai_api_key_here') {
      try {
        return await callOpenAI(prompt);
      } catch (openaiError) {
        console.log('OpenAI also unavailable. Using template fallback.');
        throw new Error('No LLM service available');
      }
    }

    console.log('No AI service configured. Using template fallback.');
    throw new Error('No LLM service available');
  }
};

/**
 * Fallback: Call OpenAI API
 */
const callOpenAI = async (prompt) => {
  const response = await axios.post(
    LLM_CONFIG.openaiUrl,
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    },
    {
      headers: {
        'Authorization': `Bearer ${LLM_CONFIG.openaiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content.trim();
};

/**
 * Smart summary generator - enhances or creates professional summary
 */
const generateSmartSummary = (data) => {
  const { summary, skills, education } = data;
  
  // Extract skill names properly (handle both string and object formats)
  const skillNames = skills?.map(s => typeof s === 'string' ? s : s.name || s).filter(Boolean) || [];
  const topSkills = skillNames.slice(0, 3).join(', ') || 'various technical skills';
  const degree = education?.[0]?.degree || education?.[0]?.field || 'a technical background';
  
  // Professional adjectives to use
  const adjectives = ['Motivated', 'Detail-oriented', 'Results-driven', 'Dedicated', 'Proactive'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  if (summary && summary.trim().length > 20) {
    // Enhance existing summary
    let enhanced = summary.trim();
    
    // Capitalize first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    
    // Remove "I am" or "I'm" from beginning
    enhanced = enhanced.replace(/^(I am|I'm)\s+/i, `${adj} `);
    
    // Clean up and ensure professional tone
    enhanced = enhanced.replace(/\s+/g, ' ');
    
    // Ensure proper ending
    if (!/[.!]$/.test(enhanced)) {
      enhanced += '.';
    }
    
    // Add skills mention if not present and we have skills
    if (skillNames.length > 0 && !skillNames.some(s => enhanced.toLowerCase().includes(s.toLowerCase()))) {
      enhanced += ` Proficient in ${topSkills}.`;
    }
    
    return enhanced;
  }

  // Generate from scratch
  return `${adj} professional with ${degree} and strong foundation in ${topSkills}. ` +
    `Eager to apply technical knowledge to real-world challenges and contribute to team success. ` +
    `Quick learner with excellent problem-solving abilities and a passion for continuous improvement.`;
};

/**
 * Fallback summary generator (no LLM) - kept for backwards compatibility
 */
const generateFallbackSummary = (data) => {
  return generateSmartSummary(data);
};

module.exports = {
  generateProfessionalSummary,
  enhanceResumeData,
  categorizeSkills,
  enhanceInternshipDescriptions,
  enhanceProjectDescription,
  enhanceInternshipDescription,
  enhanceCustomContent
};
