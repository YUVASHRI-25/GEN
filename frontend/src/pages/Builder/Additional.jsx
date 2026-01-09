import { useState } from 'react'
import { useResume } from '../../context/ResumeContext'
import { resumeAPI } from '../../services/api'

function Additional() {
  const { resumeData, updateLanguages, addCustomSection, removeCustomSection } = useResume()
  
  // Language form state
  const [newLanguage, setNewLanguage] = useState({ name: '', proficiency: 'Intermediate' })
  
  // Custom section form state
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customFormData, setCustomFormData] = useState({
    title: '',
    content: ''
  })
  const [enhancing, setEnhancing] = useState(false)
  const [error, setError] = useState('')

  // Proficiency levels
  const proficiencyLevels = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic']

  // Add language
  const handleAddLanguage = () => {
    if (newLanguage.name.trim()) {
      updateLanguages([...resumeData.languages, { ...newLanguage, name: newLanguage.name.trim() }])
      setNewLanguage({ name: '', proficiency: 'Intermediate' })
    }
  }

  const handleRemoveLanguage = (index) => {
    updateLanguages(resumeData.languages.filter((_, i) => i !== index))
  }

  // Custom section handlers
  const handleCustomChange = (e) => {
    setCustomFormData({
      ...customFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleEnhanceCustomContent = async () => {
    if (!customFormData.content || customFormData.content.trim().length < 10) {
      setError('Please add some basic content first (at least 10 characters)')
      return
    }

    setEnhancing(true)
    setError('')

    try {
      const response = await resumeAPI.enhanceCustomContent({
        content: customFormData.content,
        title: customFormData.title
      })

      if (response.success && response.enhancedContent) {
        setCustomFormData({
          ...customFormData,
          content: response.enhancedContent
        })
        setError('') // Clear any previous errors on success
      } else {
        setError('Could not enhance content. Your current content looks good!')
      }
    } catch (err) {
      console.error('Enhancement error:', err)
      // Provide a helpful fallback message
      setError('💡 AI service unavailable. Try making your content more specific and professional.')
    } finally {
      setEnhancing(false)
    }
  }

  const handleAddCustomSection = (e) => {
    e.preventDefault()
    if (customFormData.title.trim() && customFormData.content.trim()) {
      addCustomSection(customFormData)
      setCustomFormData({ title: '', content: '' })
      setShowCustomForm(false)
    }
  }

  // Quick add languages
  const commonLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi']
    .filter(lang => !resumeData.languages.find(l => l.name === lang))

  return (
    <div className="tab-section">
      <h2>➕ Additional Information</h2>
      <p>Add languages you speak and any custom sections</p>

      {/* Languages Section */}
      <div className="additional-section">
        <h3>🌐 Languages</h3>
        
        <div className="language-input-row">
          <input
            type="text"
            value={newLanguage.name}
            onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
            placeholder="e.g., English, Hindi"
            className="language-input"
          />
          <select
            value={newLanguage.proficiency}
            onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
            className="proficiency-select"
          >
            {proficiencyLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <button 
            type="button" 
            className="add-btn"
            onClick={handleAddLanguage}
          >
            + Add
          </button>
        </div>

        {/* Quick add common languages */}
        {commonLanguages.length > 0 && (
          <div className="quick-add-languages">
            <span className="quick-label">Quick add:</span>
            {commonLanguages.slice(0, 5).map((lang, index) => (
              <button
                key={index}
                className="quick-lang-btn"
                onClick={() => updateLanguages([...resumeData.languages, { name: lang, proficiency: 'Intermediate' }])}
              >
                + {lang}
              </button>
            ))}
          </div>
        )}

        {/* Languages List */}
        {resumeData.languages.length > 0 && (
          <div className="languages-list">
            {resumeData.languages.map((lang, index) => (
              <div key={index} className="language-item">
                <span className="lang-name">{lang.name}</span>
                <span className="lang-proficiency">{lang.proficiency}</span>
                <button 
                  className="remove-lang-btn"
                  onClick={() => handleRemoveLanguage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Sections */}
      <div className="additional-section">
        <h3>📋 Custom Sections</h3>
        <p className="section-hint">Add extra sections like Hobbies, Achievements, Volunteer Work, etc.</p>

        {/* Existing Custom Sections */}
        {resumeData.customSections.length > 0 && (
          <div className="custom-sections-list">
            {resumeData.customSections.map((section, index) => (
              <div key={index} className="custom-section-card">
                <button 
                  className="remove-btn"
                  onClick={() => removeCustomSection(index)}
                >
                  ×
                </button>
                <h4>{section.title}</h4>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Section Button/Form */}
        {!showCustomForm ? (
          <button 
            className="add-entry-btn"
            onClick={() => setShowCustomForm(true)}
          >
            + Add Custom Section
          </button>
        ) : (
          <form className="entry-form" onSubmit={handleAddCustomSection}>
            <h4>Add Custom Section</h4>
            
            <div className="form-group">
              <label htmlFor="title">Section Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={customFormData.title}
                onChange={handleCustomChange}
                placeholder="e.g., Hobbies, Achievements, Volunteer Work"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content *</label>
              <textarea
                id="content"
                name="content"
                value={customFormData.content}
                onChange={handleCustomChange}
                placeholder="e.g., Reading, Chess, Photography&#10;or&#10;Won first prize in college coding competition"
                rows={4}
                required
              />
              <div className="ai-enhance-section">
                <button
                  type="button"
                  className="ai-enhance-btn"
                  onClick={handleEnhanceCustomContent}
                  disabled={enhancing || !customFormData.content || customFormData.content.trim().length < 10}
                >
                  {enhancing ? '⏳ Enhancing...' : '✨ Enhance with AI'}
                </button>
                {error && <p className="ai-error">{error}</p>}
                {!customFormData.content && (
                  <p className="ai-hint">Add some basic content first to use AI enhancement</p>
                )}
              </div>
            </div>

            <div className="content-tips">
              <strong>💡 Writing Tips:</strong>
              <ul>
                <li>Be specific and relevant to your resume</li>
                <li>Use professional language</li>
                <li>Focus on achievements or skills</li>
                <li>Keep it concise (2-3 sentences or bullet points)</li>
              </ul>
            </div>

            <div className="entry-form-buttons">
              <button type="submit" className="add-btn">Save Section</button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setCustomFormData({ title: '', content: '' })
                  setShowCustomForm(false)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Suggestions */}
        {resumeData.customSections.length === 0 && !showCustomForm && (
          <div className="custom-suggestions">
            <h4>💡 Ideas for custom sections:</h4>
            <div className="suggestion-chips">
              <span className="chip" onClick={() => {
                setCustomFormData({ title: 'Hobbies & Interests', content: '' })
                setShowCustomForm(true)
              }}>🎯 Hobbies & Interests</span>
              <span className="chip" onClick={() => {
                setCustomFormData({ title: 'Achievements', content: '' })
                setShowCustomForm(true)
              }}>🏆 Achievements</span>
              <span className="chip" onClick={() => {
                setCustomFormData({ title: 'Volunteer Work', content: '' })
                setShowCustomForm(true)
              }}>🤝 Volunteer Work</span>
              <span className="chip" onClick={() => {
                setCustomFormData({ title: 'Extracurricular Activities', content: '' })
                setShowCustomForm(true)
              }}>⚽ Extracurricular</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .additional-section {
          margin-bottom: 32px;
          padding: 24px;
          background: #f8f9fb;
          border-radius: 12px;
        }
        
        .additional-section h3 {
          margin-bottom: 16px;
          color: #1a1a2e;
        }
        
        .section-hint {
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
        }
        
        .language-input-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .language-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e1e5eb;
          border-radius: 8px;
          font-size: 16px;
        }
        
        .language-input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .proficiency-select {
          padding: 12px 16px;
          border: 2px solid #e1e5eb;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }
        
        .quick-add-languages {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .quick-label {
          color: #666;
          font-size: 13px;
        }
        
        .quick-lang-btn {
          padding: 6px 12px;
          background: white;
          border: 1px dashed #ccc;
          border-radius: 16px;
          font-size: 12px;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .quick-lang-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }
        
        .languages-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }
        
        .language-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: white;
          border: 1px solid #e1e5eb;
          border-radius: 8px;
        }
        
        .lang-name {
          font-weight: 500;
          color: #333;
        }
        
        .lang-proficiency {
          font-size: 12px;
          color: #667eea;
          background: #667eea15;
          padding: 2px 8px;
          border-radius: 10px;
        }
        
        .remove-lang-btn {
          background: none;
          border: none;
          color: #999;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
        }
        
        .remove-lang-btn:hover {
          color: #c00;
        }
        
        .custom-sections-list {
          margin-bottom: 16px;
        }
        
        .custom-section-card {
          background: white;
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 12px;
          position: relative;
          border-left: 4px solid #667eea;
        }
        
        .custom-section-card h4 {
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        
        .custom-section-card p {
          color: #555;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-line;
        }
        
        .add-entry-btn {
          width: 100%;
          padding: 16px;
          background: white;
          border: 2px dashed #ccc;
          border-radius: 12px;
          color: #666;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .add-entry-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }
        
        .custom-suggestions {
          margin-top: 16px;
        }
        
        .custom-suggestions h4 {
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
        }
        
        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .chip {
          padding: 8px 16px;
          background: white;
          border: 1px solid #e1e5eb;
          border-radius: 20px;
          font-size: 13px;
          color: #555;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .chip:hover {
          border-color: #667eea;
          color: #667eea;
          background: #667eea08;
        }

        .ai-enhance-section {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ai-enhance-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          align-self: flex-start;
        }

        .ai-enhance-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .ai-enhance-btn:disabled {
          background: #a0aec0;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .ai-error {
          color: #e53e3e;
          font-size: 13px;
          margin: 0;
        }

        .ai-hint {
          color: #718096;
          font-size: 13px;
          margin: 0;
          font-style: italic;
        }

        .content-tips {
          background: #f7fafc;
          border-left: 3px solid #667eea;
          padding: 12px 16px;
          margin-top: 12px;
          border-radius: 4px;
          font-size: 13px;
        }

        .content-tips strong {
          color: #667eea;
          display: block;
          margin-bottom: 8px;
        }

        .content-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .content-tips li {
          margin: 4px 0;
          color: #4a5568;
        }
        
        @media (max-width: 600px) {
          .language-input-row {
            flex-wrap: wrap;
          }
          
          .language-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default Additional
