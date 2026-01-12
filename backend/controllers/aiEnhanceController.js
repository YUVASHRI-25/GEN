/**
 * AI Enhancement Controller
 * Handles AI-powered content enhancement for resume sections
 */

const llmService = require('../services/llmService');

/**
 * Enhance resume section content
 * POST /api/resume/enhance
 */
const enhanceContent = async (req, res) => {
  try {
    const { content, sectionType, sectionTitle } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for enhancement'
      });
    }

    console.log(`🤖 Enhancing ${sectionType || sectionTitle || 'content'}...`);

    let enhancedContent;

    // Route to appropriate enhancement function based on section type
    switch (sectionType?.toLowerCase()) {
      case 'summary':
      case 'profile summary':
      case 'professional summary':
        enhancedContent = await enhanceSummary(content);
        break;

      case 'objective':
      case 'career objective':
        enhancedContent = await enhanceObjective(content);
        break;

      case 'experience':
      case 'work experience':
      case 'internship':
      case 'internships':
        enhancedContent = await enhanceExperience(content, sectionTitle);
        break;

      case 'skills':
      case 'technical skills':
        enhancedContent = await enhanceSkills(content);
        break;

      case 'projects':
      case 'project':
        enhancedContent = await enhanceProject(content);
        break;

      case 'education':
        enhancedContent = await enhanceEducation(content);
        break;

      case 'achievements':
      case 'awards':
        enhancedContent = await enhanceAchievements(content);
        break;

      case 'certifications':
      case 'certificates':
        enhancedContent = await enhanceCertifications(content);
        break;

      default:
        enhancedContent = await enhanceGeneric(content, sectionTitle);
    }

    console.log('✅ Content enhanced successfully');

    res.json({
      success: true,
      message: 'Content enhanced successfully',
      data: {
        original: content,
        enhanced: enhancedContent
      }
    });

  } catch (error) {
    console.error('AI enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance content',
      error: error.message
    });
  }
};

/**
 * Enhance summary section
 */
const enhanceSummary = async (content) => {
  const prompt = `You are an expert resume writer. Enhance the following professional summary for a resume.

Original Summary:
${content}

Requirements:
- Improve clarity, grammar, and professional impact
- Do NOT change the meaning or add false information
- Keep it concise (2-4 sentences)
- Use professional language
- Avoid personal pronouns (I, me, my) where possible
- Make it ATS-friendly with relevant keywords
- Highlight key strengths and value proposition

Return ONLY the enhanced summary text, no explanations or formatting.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Enhance career objective
 */
const enhanceObjective = async (content) => {
  const prompt = `You are an expert resume writer. Enhance the following career objective for a resume.

Original Objective:
${content}

Requirements:
- Improve clarity and professional impact
- Keep it focused and goal-oriented
- Do NOT change the meaning
- Keep it concise (2-3 sentences)
- Highlight career goals and what you bring to employers
- Make it specific to the field/role mentioned

Return ONLY the enhanced objective text, no explanations.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Enhance experience/internship descriptions
 */
const enhanceExperience = async (content, title) => {
  const prompt = `You are an expert resume writer. Enhance the following work experience/internship description for a resume.

Section: ${title || 'Experience'}

Original Content:
${content}

Requirements:
- Start each point with strong action verbs (Developed, Implemented, Led, etc.)
- Add quantifiable achievements where possible
- Improve clarity and professional impact
- Do NOT add false information or change meaning
- Keep each point concise and impactful
- Use bullet point format
- Make it ATS-friendly

Return ONLY the enhanced description, formatted as bullet points.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Enhance skills section
 */
const enhanceSkills = async (content) => {
  const prompt = `You are an expert resume writer. Enhance the following skills section for a resume.

Original Skills:
${content}

Requirements:
- Organize skills logically (by category if appropriate)
- Remove any redundant items
- Keep the same skills, just better organized
- Do NOT add skills that weren't mentioned
- Use industry-standard terminology
- Make it ATS-friendly

Return ONLY the enhanced skills list, no explanations.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Enhance project descriptions
 */
const enhanceProject = async (content) => {
  const prompt = `You are an expert resume writer. Enhance the following project description for a resume.

Original Project Description:
${content}

Requirements:
- Highlight the problem solved and impact
- Mention technologies used prominently
- Use action verbs
- Keep it concise (2-3 sentences per project)
- Do NOT add false information
- Focus on your contributions and results

Return ONLY the enhanced project description, no explanations.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Enhance education section
 */
const enhanceEducation = async (content) => {
  const prompt = `You are an expert resume writer. Enhance the following education section for a resume.

Original Education:
${content}

Requirements:
- Ensure proper formatting (degree, institution, year)
- Highlight relevant coursework, GPA if strong
- Keep it professional and concise
- Do NOT add false information
- Include achievements if mentioned

Return ONLY the enhanced education text, no explanations.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Enhance achievements/awards section
 */
const enhanceAchievements = async (content) => {
  const prompt = `You are an expert resume writer. Enhance the following achievements section for a resume.

Original Achievements:
${content}

Requirements:
- Make each achievement impactful
- Quantify results where possible
- Use strong action verbs
- Keep it concise
- Do NOT add false information
- Focus on significance and recognition

Return ONLY the enhanced achievements, no explanations.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Enhance certifications section
 */
const enhanceCertifications = async (content) => {
  const prompt = `You are an expert resume writer. Enhance the following certifications section for a resume.

Original Certifications:
${content}

Requirements:
- Ensure proper formatting (certification name, issuer, date)
- Order by relevance or recency
- Include credential IDs if mentioned
- Keep it professional
- Do NOT add false information

Return ONLY the enhanced certifications list, no explanations.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Enhance generic content
 */
const enhanceGeneric = async (content, sectionTitle) => {
  const prompt = `You are an expert resume writer. Enhance the following resume section content.

Section: ${sectionTitle || 'Resume Section'}

Original Content:
${content}

Requirements:
- Improve clarity, grammar, and professional impact
- Do NOT change the meaning or add false information
- Keep the same general length
- Use professional language
- Make it suitable for a resume/CV

Return ONLY the enhanced content, no explanations.`;

  return await callLLMWithFallback(prompt, content);
};

/**
 * Call LLM with fallback to original content
 */
const callLLMWithFallback = async (prompt, originalContent) => {
  try {
    // Use existing LLM service infrastructure
    const axios = require('axios');
    
    const LLM_CONFIG = {
      ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      model: process.env.LLM_MODEL || 'mistral',
      openaiUrl: 'https://api.openai.com/v1/chat/completions',
      openaiKey: process.env.OPENAI_API_KEY
    };

    try {
      // Try Ollama first
      const response = await axios.post(
        `${LLM_CONFIG.ollamaUrl}/api/generate`,
        {
          model: LLM_CONFIG.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000
          }
        },
        { timeout: 60000 }
      );

      const enhanced = response.data.response?.trim();
      if (enhanced && enhanced.length > 10) {
        return enhanced;
      }
    } catch (ollamaError) {
      console.log('Ollama not available, trying OpenAI...');
      
      // Try OpenAI if configured
      if (LLM_CONFIG.openaiKey && LLM_CONFIG.openaiKey !== 'your_openai_api_key_here') {
        const response = await axios.post(
          LLM_CONFIG.openaiUrl,
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${LLM_CONFIG.openaiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data.choices[0].message.content.trim();
      }
    }

    // If no AI available, return improved version using basic rules
    return applyBasicEnhancements(originalContent);

  } catch (error) {
    console.log('AI enhancement unavailable, using basic improvements');
    return applyBasicEnhancements(originalContent);
  }
};

/**
 * Apply basic text enhancements without AI
 */
const applyBasicEnhancements = (content) => {
  // Basic cleanup and formatting
  let enhanced = content.trim();
  
  // Capitalize first letter of sentences
  enhanced = enhanced.replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());
  
  // Remove extra whitespace
  enhanced = enhanced.replace(/\s+/g, ' ');
  
  // Ensure proper ending punctuation
  if (enhanced && !/[.!?]$/.test(enhanced)) {
    enhanced += '.';
  }
  
  return enhanced;
};

/**
 * Batch enhance multiple sections
 * POST /api/resume/enhance-batch
 */
const enhanceBatch = async (req, res) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        message: 'Sections array is required'
      });
    }

    const enhancedSections = await Promise.all(
      sections.map(async (section) => {
        try {
          const enhanced = await enhanceGeneric(section.content, section.heading);
          return {
            ...section,
            content: enhanced
          };
        } catch (error) {
          return section; // Return original on error
        }
      })
    );

    res.json({
      success: true,
      message: 'Sections enhanced successfully',
      data: enhancedSections
    });

  } catch (error) {
    console.error('Batch enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance sections',
      error: error.message
    });
  }
};

module.exports = {
  enhanceContent,
  enhanceBatch
};
