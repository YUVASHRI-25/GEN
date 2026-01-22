import { useState } from 'react'
import { useResume } from '../../context/ResumeContext'

function Education() {
  const { resumeData, addEducation, updateEducation, removeEducation } = useResume()
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [formData, setFormData] = useState({
    degree: '',
    college: '',
    year: '',
    gpa: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.degree && formData.college) {
      if (editingIndex !== null) {
        updateEducation(editingIndex, formData)
        setEditingIndex(null)
      } else {
        addEducation(formData)
      }
      setFormData({ degree: '', college: '', year: '', gpa: '' })
      setShowForm(false)
    }
  }

  const handleEdit = (index) => {
    const edu = resumeData.education[index]
    setFormData({
      degree: edu.degree || '',
      college: edu.college || edu.institution || '',
      year: edu.year || edu.yearRange || '',
      gpa: edu.gpa || ''
    })
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData({ degree: '', college: '', year: '', gpa: '' })
    setEditingIndex(null)
    setShowForm(false)
  }

  return (
    <div className="tab-section">
      <h2>🎓 Education</h2>
      <p>Add your educational qualifications</p>

      {/* Existing Education Entries */}
      {resumeData.education.length > 0 && (
        <div className="entries-list">
          {resumeData.education.map((edu, index) => (
            <div key={index} className="entry-card">
              <div className="entry-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(index)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  className="remove-btn"
                  onClick={() => removeEducation(index)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
              <div className="entry-header">
                <span className="entry-title">{edu.degree}</span>
                <span className="entry-date">{edu.year || edu.yearRange}</span>
              </div>
              <div className="entry-subtitle">{edu.college || edu.institution}</div>
              {edu.gpa && <div className="entry-detail">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Add Education Button/Form */}
      {!showForm ? (
        <button 
          className="add-entry-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Education
        </button>
      ) : (
        <form className="entry-form" onSubmit={handleSubmit}>
          <h4>{editingIndex !== null ? 'Edit Education' : 'Add Education'}</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="degree">Degree *</label>
              <input
                type="text"
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g., B.E Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="college">College/University *</label>
              <input
                type="text"
                id="college"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g., ABC Engineering College"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="text"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g., 2024 - 2028"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gpa">GPA (optional)</label>
              <input
                type="text"
                id="gpa"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                placeholder="e.g., 8.5/10"
              />
            </div>
          </div>

          <div className="entry-form-buttons">
            <button type="submit" className="add-btn">{editingIndex !== null ? 'Update Education' : 'Save Education'}</button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}

      <div className="tip-box">
        <strong>💡 Tip:</strong> Include your current degree first. 
        You can also add 12th/10th scores if your college marks aren't available yet.
      </div>

      <style>{`
        .entries-list {
          margin-bottom: 20px;
          padding-top: 8px;
        }
        
        .entry-card {
          margin-top: 40px;
        }
        
        .entry-card:first-child {
          margin-top: 0;
        }
        
        .entry-actions {
          position: absolute;
          top: -36px;
          right: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          z-index: 10;
        }
        
        .edit-btn,
        .remove-btn {
          background: #e0e7ff;
          border: none;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          min-width: 28px;
          min-height: 28px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .edit-btn:hover {
          background: #c7d2fe;
          transform: scale(1.1);
        }
        
        .remove-btn {
          background: #fee2e2;
          color: #dc2626;
          font-size: 18px;
          font-weight: bold;
          line-height: 1;
        }
        
        .remove-btn:hover {
          background: #fecaca;
          color: #b91c1c;
          transform: scale(1.1);
        }
        
        .entry-detail {
          font-size: 13px;
          color: #667eea;
          margin-top: 4px;
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
        
        .tip-box {
          margin-top: 24px;
          padding: 16px;
          background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
          border-radius: 8px;
          font-size: 14px;
          color: #555;
        }
        
        .tip-box strong {
          color: #667eea;
        }
        
        @media (max-width: 480px) {
          .entry-actions {
            top: -32px;
            gap: 6px;
          }
          
          .entry-card {
            margin-top: 36px;
          }
          
          .entry-card:first-child {
            margin-top: 0;
          }
          
          .edit-btn,
          .remove-btn {
            width: 26px;
            height: 26px;
            min-width: 26px;
            min-height: 26px;
            font-size: 12px;
          }
          
          .remove-btn {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default Education
