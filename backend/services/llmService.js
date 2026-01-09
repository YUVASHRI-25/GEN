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
    return response;
  } catch (error) {
    console.log('AI enhancement unavailable, using fallback for summary');
    // Fallback: return a template summary
    return generateFallbackSummary(data);
  }
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
    return response;
  } catch (error) {
    console.log('AI enhancement unavailable, using fallback for project description');
    // Fallback: return a template description
    return generateFallbackProjectDescription(data);
  }
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
    return response;
  } catch (error) {
    console.log('AI enhancement unavailable, using fallback for internship description');
    // Fallback: return a template description
    return generateFallbackInternshipDescription(data);
  }
};

/**
 * Fallback project description generator (no LLM)
 */
const generateFallbackProjectDescription = (data) => {
  const { projectName, technologies, description } = data;
  const tech = technologies || 'modern technologies';
  
  if (description && description.trim().length > 10) {
    return description; // Return original if it exists
  }
  
  return `Developed ${projectName || 'a project'} using ${tech}. Implemented key features and functionalities to demonstrate practical application of technical skills. Enhanced problem-solving abilities through hands-on development experience.`;
};

/**
 * Fallback internship description generator (no LLM)
 */
const generateFallbackInternshipDescription = (data) => {
  const { title, company, description } = data;
  const role = title || 'position';
  const org = company || 'the organization';
  
  if (description && description.trim().length > 10) {
    return description; // Return original if it exists
  }
  
  return `Worked as ${role} at ${org}. Collaborated with team members on various projects and contributed to key deliverables. Gained practical experience in industry-standard tools and methodologies while developing professional skills.`;
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
    return response;
  } catch (error) {
    console.log('AI enhancement unavailable, using fallback for custom content');
    // Fallback: return a template content
    return generateFallbackCustomContent(data);
  }
};

/**
 * Fallback custom content generator (no LLM)
 */
const generateFallbackCustomContent = (data) => {
  const { title, content } = data;
  
  if (content && content.trim().length > 10) {
    return content; // Return original if it exists
  }
  
  // Generic fallback based on common section titles
  if (title && title.toLowerCase().includes('hobby') || title?.toLowerCase().includes('interest')) {
    return 'Passionate about continuous learning and exploring new technologies. Enjoy problem-solving challenges and staying updated with industry trends.';
  }
  
  if (title && title.toLowerCase().includes('achievement')) {
    return 'Consistently demonstrated strong academic performance and active participation in extracurricular activities. Recognized for dedication to personal and professional growth.';
  }
  
  if (title && title.toLowerCase().includes('volunteer')) {
    return 'Actively contributed to community service initiatives. Developed leadership and teamwork skills through collaborative volunteer projects.';
  }
  
  return 'Demonstrated commitment to personal growth and professional development through various activities and experiences.';
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
 * Fallback summary generator (no LLM)
 */
const generateFallbackSummary = (data) => {
  const skills = data.skills?.slice(0, 3).join(', ') || 'various technical skills';
  const degree = data.education?.[0]?.degree || 'Engineering';
  
  return `Motivated ${degree} student with strong foundation in ${skills}. ` +
    `Eager to apply academic knowledge to real-world challenges. ` +
    `Quick learner with excellent problem-solving abilities and team collaboration skills.`;
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
