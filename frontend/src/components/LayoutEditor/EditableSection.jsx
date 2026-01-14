import { useState, useRef, useEffect } from 'react'
import './EditableSection.css'

/**
 * EditableSection Component
 * Renders an editable section with rich text support and AI enhancement
 */
function EditableSection({
  section,
  sectionIndex,
  totalSections,
  onUpdate,
  onEnhance,
  onDelete,
  onMove,
  isEnhancing = false,
  canEnhance = false
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`
    }
  }, [section.content])

  const handleContentChange = (e) => {
    onUpdate(sectionIndex, 'content', e.target.value)
  }

  const handleHeadingChange = (e) => {
    onUpdate(sectionIndex, 'heading', e.target.value)
  }

  return (
    <div className="editable-section">
      {/* Section Header */}
      <div className="section-header">
        <div className="header-left">
          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <input
            type="text"
            className="heading-input"
            value={section.heading}
            onChange={handleHeadingChange}
            placeholder="Section Title"
          />
        </div>
        <div className="header-actions">
          <button
            className="action-btn move-btn"
            onClick={() => onMove(sectionIndex, 'up')}
            disabled={sectionIndex === 0}
            title="Move Up"
          >
            ↑
          </button>
          <button
            className="action-btn move-btn"
            onClick={() => onMove(sectionIndex, 'down')}
            disabled={sectionIndex === totalSections - 1}
            title="Move Down"
          >
            ↓
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(sectionIndex)}
            title="Delete Section"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="section-content">
          <textarea
            ref={textareaRef}
            className="content-textarea"
            value={section.content}
            onChange={handleContentChange}
            placeholder={getPlaceholder(section.type)}
          />

          {/* Action Buttons */}
          <div className="section-actions">
            {canEnhance && (
              <button
                className={`enhance-btn ${isEnhancing ? 'enhancing' : ''}`}
                onClick={() => onEnhance(sectionIndex)}
                disabled={isEnhancing || !section.content?.trim()}
              >
                {isEnhancing ? (
                  <>
                    <span className="spinner"></span>
                    Enhancing...
                  </>
                ) : (
                  <>
                    ✨ Enhance with AI
                  </>
                )}
              </button>
            )}

            <div className="content-stats">
              <span className="word-count">
                {countWords(section.content)} words
              </span>
            </div>
          </div>

          {/* Section Tips */}
          {canEnhance && (
            <div className="section-tips">
              <p className="tip">
                💡 {getTip(section.type)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Get placeholder text for section type
 */
function getPlaceholder(type) {
  const placeholders = {
    summary: 'Write a professional summary highlighting your key skills and experience...',
    education: 'Add your educational qualifications, degrees, certifications...',
    experience: 'Describe your work experience, responsibilities, and achievements...',
    internship: 'Detail your internship experience and what you learned...',
    projects: 'Describe your projects, technologies used, and outcomes...',
    skills: 'List your technical and soft skills...',
    certifications: 'Add your certifications and credentials...',
    achievements: 'List your achievements, awards, and recognitions...',
    other: 'Add content for this section...'
  }
  return placeholders[type] || placeholders.other
}

/**
 * Get tip for section type
 */
function getTip(type) {
  const tips = {
    summary: 'AI can help make your summary more impactful and ATS-friendly',
    education: 'Include relevant coursework, GPA if strong, and achievements',
    experience: 'Use action verbs and quantify achievements where possible',
    internship: 'Highlight skills learned and projects you contributed to',
    projects: 'Describe the problem, your solution, and technologies used'
  }
  return tips[type] || 'Click Enhance with AI to improve this content'
}

/**
 * Count words in text
 */
function countWords(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export default EditableSection
