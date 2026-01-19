import { useState } from 'react'
import { useResume } from '../../context/ResumeContext'
import { resumeAPI } from '../../services/api'

function Summary() {
  const { resumeData, updateSummary } = useResume()
  const [enhancing, setEnhancing] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    updateSummary(e.target.value)
  }

  const handleEnhanceWithAI = async () => {
    setEnhancing(true)
    setError('')

    try {
      const response = await resumeAPI.enhanceSummary({
        summary: resumeData.summary,
        skills: resumeData.skills.map(s => typeof s === 'string' ? s : s.name || s),
        education: resumeData.education
      })

      if (response.success && response.enhancedSummary) {
        updateSummary(response.enhancedSummary)
      } else if (response.enhancedSummary) {
        // Handle case where success might not be explicitly true but we have content
        updateSummary(response.enhancedSummary)
      } else {
        setError('Enhancement completed but no changes were needed.')
      }
    } catch (err) {
      console.error('Enhancement error:', err)
      // Even on error, try to use the response if available
      if (err.response?.data?.enhancedSummary) {
        updateSummary(err.response.data.enhancedSummary)
      } else {
        setError('Could not enhance summary. Please try again or write your summary manually.')
      }
    } finally {
      setEnhancing(false)
    }
  }

  // Generate a basic template summary
  const generateTemplateSummary = () => {
    const name = resumeData.contact.name || 'A motivated student'
    // Extract skill names from skill objects
    const skillNames = resumeData.skills.length > 0 
      ? resumeData.skills.slice(0, 3).map(skill => skill.name).join(', ')
      : 'various technical skills'
    const degree = resumeData.education[0]?.degree || 'Engineering'

    const template = `${degree} student with a strong foundation in ${skillNames}. Eager to apply academic knowledge to real-world challenges. Quick learner with excellent problem-solving abilities and a passion for technology.`
    
    updateSummary(template)
  }

  return (
    <div className="tab-section">
      <h2>📝 Professional Summary</h2>
      <p>Write a brief summary about yourself (2-3 sentences)</p>

      <div className="form-group">
        <label htmlFor="summary">Your Summary</label>
        <textarea
          id="summary"
          value={resumeData.summary}
          onChange={handleChange}
          placeholder="Write a brief professional summary about yourself...&#10;&#10;Example: Motivated Computer Science student with strong foundation in Python and web development. Eager to apply academic knowledge to real-world challenges. Quick learner with excellent problem-solving abilities."
          rows={6}
        />
        <div className="char-count">
          {resumeData.summary.length} / 300 characters recommended
        </div>
      </div>

      <div className="ai-section">
        <h4>🤖 Need help writing?</h4>
        <div className="ai-buttons">
          <button 
            className="ai-btn template-btn"
            onClick={generateTemplateSummary}
          >
            📄 Use Template
          </button>
          <button 
            className="ai-btn enhance-btn"
            onClick={handleEnhanceWithAI}
            disabled={enhancing || !resumeData.skills.length}
          >
            {enhancing ? '⏳ Enhancing...' : '✨ Enhance with AI'}
          </button>
        </div>
        {error && <p className="ai-error">{error}</p>}
        {!resumeData.skills.length && (
          <p className="ai-hint">Add some skills first to use AI enhancement</p>
        )}
      </div>

      <div className="summary-tips">
        <h4>💡 Tips for a Great Summary:</h4>
        <ul>
          <li><strong>Keep it brief:</strong> 2-3 sentences is perfect</li>
          <li><strong>Highlight strengths:</strong> Mention your key skills</li>
          <li><strong>Show enthusiasm:</strong> Express eagerness to learn</li>
          <li><strong>Be specific:</strong> Mention your degree/field</li>
          <li><strong>Avoid "I":</strong> Use third person or start with your role</li>
        </ul>
      </div>

      <div className="final-checklist">
        <h4>✅ Before You Generate:</h4>
        <div className="checklist-items">
          <label className="checklist-item">
            <input type="checkbox" checked={!!resumeData.contact.name} readOnly />
            <span>Contact information added</span>
          </label>
          <label className="checklist-item">
            <input type="checkbox" checked={resumeData.skills.length > 0} readOnly />
            <span>Skills added ({resumeData.skills.length})</span>
          </label>
          <label className="checklist-item">
            <input type="checkbox" checked={resumeData.education.length > 0} readOnly />
            <span>Education added</span>
          </label>
          <label className="checklist-item">
            <input type="checkbox" checked={!!resumeData.summary} readOnly />
            <span>Summary written</span>
          </label>
        </div>
      </div>

      <style>{`
        .char-count {
          text-align: right;
          font-size: 12px;
          color: ${resumeData.summary.length > 300 ? '#c00' : '#999'};
          margin-top: 8px;
        }
        
        .ai-section {
          margin-top: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
          border-radius: 12px;
        }
        
        .ai-section h4 {
          margin-bottom: 12px;
          color: #1a1a2e;
        }
        
        .ai-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .ai-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .template-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }
        
        .template-btn:hover {
          background: #667eea;
          color: white;
        }
        
        .enhance-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .enhance-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .enhance-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .ai-error {
          color: #c00;
          font-size: 13px;
          margin-top: 12px;
        }
        
        .ai-hint {
          color: #666;
          font-size: 13px;
          margin-top: 12px;
        }
        
        .summary-tips {
          margin-top: 24px;
          padding: 20px;
          background: #f8f9fb;
          border-radius: 12px;
        }
        
        .summary-tips h4 {
          margin-bottom: 12px;
          color: #1a1a2e;
        }
        
        .summary-tips ul {
          margin-left: 20px;
        }
        
        .summary-tips li {
          margin-bottom: 8px;
          color: #555;
          font-size: 14px;
        }
        
        .final-checklist {
          margin-top: 24px;
          padding: 20px;
          background: #e8f5e9;
          border-radius: 12px;
        }
        
        .final-checklist h4 {
          margin-bottom: 16px;
          color: #2e7d32;
        }
        
        .checklist-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .checklist-item {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: default;
        }
        
        .checklist-item input {
          width: 18px;
          height: 18px;
          accent-color: #2e7d32;
        }
        
        .checklist-item span {
          color: #444;
        }
      `}</style>
    </div>
  )
}

export default Summary
