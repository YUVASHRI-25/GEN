import { useState } from 'react'
import './AddSectionPanel.css'

/**
 * Predefined section types that can be added
 */
const PREDEFINED_SECTIONS = [
  {
    id: 'profile-summary',
    name: 'Profile Summary',
    type: 'summary',
    icon: '📝',
    description: 'A brief overview of your professional background and goals'
  },
  {
    id: 'career-objective',
    name: 'Career Objective',
    type: 'summary',
    icon: '🎯',
    description: 'Your career goals and what you aim to achieve'
  },
  {
    id: 'education',
    name: 'Education',
    type: 'education',
    icon: '🎓',
    description: 'Your educational background and qualifications'
  },
  {
    id: 'work-experience',
    name: 'Work Experience',
    type: 'experience',
    icon: '💼',
    description: 'Your professional work history and achievements'
  },
  {
    id: 'internships',
    name: 'Internships',
    type: 'internship',
    icon: '🏢',
    description: 'Internship experiences and learnings'
  },
  {
    id: 'projects',
    name: 'Projects',
    type: 'projects',
    icon: '🚀',
    description: 'Personal or academic projects you have worked on'
  },
  {
    id: 'skills',
    name: 'Skills',
    type: 'skills',
    icon: '⚡',
    description: 'Technical and soft skills you possess'
  },
  {
    id: 'certifications',
    name: 'Certifications',
    type: 'certifications',
    icon: '🏆',
    description: 'Professional certifications and courses completed'
  },
  {
    id: 'achievements',
    name: 'Achievements',
    type: 'achievements',
    icon: '⭐',
    description: 'Awards, honors, and notable accomplishments'
  },
  {
    id: 'languages',
    name: 'Languages',
    type: 'other',
    icon: '🌐',
    description: 'Languages you can speak and write'
  },
  {
    id: 'hobbies',
    name: 'Hobbies & Interests',
    type: 'other',
    icon: '🎨',
    description: 'Personal interests and activities'
  },
  {
    id: 'references',
    name: 'References',
    type: 'other',
    icon: '👥',
    description: 'Professional references'
  }
]

/**
 * AddSectionPanel Component
 * Allows users to add new predefined or custom sections
 */
function AddSectionPanel({ onAddSection }) {
  const [customSectionName, setCustomSectionName] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleAddPredefined = (section) => {
    onAddSection({
      name: section.name,
      type: section.type,
      isCustom: false
    })
  }

  const handleAddCustom = () => {
    if (!customSectionName.trim()) {
      return
    }

    onAddSection({
      name: customSectionName.trim(),
      type: 'other',
      isCustom: true
    })

    setCustomSectionName('')
    setShowCustomInput(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCustom()
    }
  }

  return (
    <div className="add-section-panel">
      <div className="panel-intro">
        <h3>Add New Section</h3>
        <p>Choose a section type or create your own custom section</p>
      </div>

      {/* Predefined Sections Grid */}
      <div className="sections-grid">
        {PREDEFINED_SECTIONS.map(section => (
          <button
            key={section.id}
            className="section-card"
            onClick={() => handleAddPredefined(section)}
          >
            <span className="card-icon">{section.icon}</span>
            <span className="card-name">{section.name}</span>
            <span className="card-desc">{section.description}</span>
          </button>
        ))}
      </div>

      {/* Custom Section */}
      <div className="custom-section-area">
        <h4>➕ Custom Section</h4>
        
        {showCustomInput ? (
          <div className="custom-input-group">
            <input
              type="text"
              className="custom-name-input"
              placeholder="Enter section name..."
              value={customSectionName}
              onChange={(e) => setCustomSectionName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <div className="custom-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomSectionName('')
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddCustom}
                disabled={!customSectionName.trim()}
              >
                Add Section
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="show-custom-btn"
            onClick={() => setShowCustomInput(true)}
          >
            <span className="btn-icon">✏️</span>
            <span>Create Custom Section</span>
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="add-section-tips">
        <h5>💡 Tips</h5>
        <ul>
          <li>New sections will appear at the end of your resume</li>
          <li>You can reorder sections using the arrow buttons</li>
          <li>AI enhancement is available for Summary, Education, Projects, and Experience sections</li>
        </ul>
      </div>
    </div>
  )
}

export default AddSectionPanel
