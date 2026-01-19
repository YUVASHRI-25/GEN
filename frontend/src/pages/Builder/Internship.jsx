import { useState } from 'react'
import { useResume } from '../../context/ResumeContext'
import { resumeAPI } from '../../services/api'

function Internship() {
  const { resumeData, addInternship, removeInternship } = useResume()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    duration: '',
    description: ''
  })
  const [enhancing, setEnhancing] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEnhanceDescription = async () => {
    if (!formData.description || formData.description.trim().length < 10) {
      setError('Please add a basic description first (at least 10 characters)')
      return
    }

    setEnhancing(true)
    setError('')

    try {
      const response = await resumeAPI.enhanceInternshipDescription({
        description: formData.description,
        title: formData.title,
        company: formData.company
      })

      if (response.enhancedDescription) {
        setFormData({
          ...formData,
          description: response.enhancedDescription
        })
        setError('') // Clear any previous errors on success
      } else {
        setError('Enhancement completed. Your description has been improved!')
      }
    } catch (err) {
      console.error('Enhancement error:', err)
      // Try to use the response even on error
      if (err.response?.data?.enhancedDescription) {
        setFormData({
          ...formData,
          description: err.response.data.enhancedDescription
        })
      } else {
        setError('Could not enhance description. Please try again.')
      }
    } finally {
      setEnhancing(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title && formData.company) {
      addInternship(formData)
      setFormData({ title: '', company: '', duration: '', description: '' })
      setShowForm(false)
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', company: '', duration: '', description: '' })
    setShowForm(false)
  }

  return (
    <div className="tab-section">
      <h2>💼 Internship / Experience</h2>
      <p>Add any internships, part-time work, or project experience</p>

      {/* Existing Internship Entries */}
      {resumeData.internship.length > 0 && (
        <div className="entries-list">
          {resumeData.internship.map((intern, index) => (
            <div key={index} className="entry-card">
              <button 
                className="remove-btn"
                onClick={() => removeInternship(index)}
              >
                ×
              </button>
              <div className="entry-header">
                <span className="entry-title">{intern.title}</span>
                <span className="entry-date">{intern.duration}</span>
              </div>
              <div className="entry-subtitle">{intern.company}</div>
              {intern.description && (
                <p className="entry-description">{intern.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Internship Button/Form */}
      {!showForm ? (
        <button 
          className="add-entry-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Internship / Experience
        </button>
      ) : (
        <form className="entry-form" onSubmit={handleSubmit}>
          <h4>Add Internship</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Role / Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Web Development Intern"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company / Organization *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., TechCorp India"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., June 2025 - August 2025"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (what you did)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your responsibilities and achievements...&#10;e.g., Built responsive web pages using HTML/CSS. Worked on a team project."
              rows={4}
            />
            <div className="ai-enhance-section">
              <button
                type="button"
                className="ai-enhance-btn"
                onClick={handleEnhanceDescription}
                disabled={enhancing || !formData.description || formData.description.trim().length < 10}
              >
                {enhancing ? '⏳ Enhancing...' : '✨ Enhance with AI'}
              </button>
              {error && <p className="ai-error">{error}</p>}
              {!formData.description && (
                <p className="ai-hint">Add a basic description first to use AI enhancement</p>
              )}
            </div>
          </div>

          <div className="description-tips">
            <strong>💡 Writing Tips:</strong>
            <ul>
              <li>Use action verbs (Developed, Implemented, Collaborated)</li>
              <li>Mention specific technologies and tools you used</li>
              <li>Include quantifiable results (e.g., "improved by 20%")</li>
              <li>Focus on your contributions and achievements</li>
            </ul>
          </div>

          <div className="entry-form-buttons">
            <button type="submit" className="add-btn">Save Internship</button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}

      {/* No Experience Message */}
      {resumeData.internship.length === 0 && !showForm && (
        <div className="no-experience-tip">
          <p><strong>🎓 No internship yet?</strong></p>
          <p>That's okay! As a first-year student, you can:</p>
          <ul>
            <li>Add academic projects as experience</li>
            <li>Include hackathons or coding competitions</li>
            <li>Mention volunteer work or club activities</li>
            <li>Skip this section and focus on skills</li>
          </ul>
        </div>
      )}

      <style>{`
        .entries-list {
          margin-bottom: 20px;
        }
        
        .entry-description {
          margin-top: 8px;
          font-size: 14px;
          color: #555;
          line-height: 1.5;
        }
        
        .add-entry-btn {
          width: 100%;
          padding: 16px;
          background: #f8f9fb;
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
          background: #667eea08;
        }
        
        .no-experience-tip {
          margin-top: 24px;
          padding: 20px;
          background: #fff8e6;
          border-radius: 12px;
          border-left: 4px solid #ffc107;
        }
        
        .no-experience-tip p {
          margin-bottom: 8px;
          color: #666;
        }
        
        .no-experience-tip ul {
          margin-left: 20px;
          color: #666;
        }
        
        .no-experience-tip li {
          margin-bottom: 4px;
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

        .description-tips {
          background: #f7fafc;
          border-left: 3px solid #667eea;
          padding: 12px 16px;
          margin-top: 12px;
          border-radius: 4px;
          font-size: 13px;
        }

        .description-tips strong {
          color: #667eea;
          display: block;
          margin-bottom: 8px;
        }

        .description-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .description-tips li {
          margin: 4px 0;
          color: #4a5568;
        }
      `}</style>
    </div>
  )
}

export default Internship
