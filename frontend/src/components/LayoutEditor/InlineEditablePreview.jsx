import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../../services/api'
import './InlineEditablePreview.css'

/**
 * InlineEditablePreview Component
 * Displays the preserved resume layout with direct inline editing
 * Click on any text to edit directly on the resume
 */
function InlineEditablePreview({
  layoutHtml,
  sections,
  dimensions,
  scale = 1,
  onSectionsUpdate,
  onAddSection,
  resumeData
}) {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const [currentScale, setCurrentScale] = useState(scale)
  const [editingElement, setEditingElement] = useState(null)
  const [editedContent, setEditedContent] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showAddPanel, setShowAddPanel] = useState(false)

  // Calculate responsive scale
  useEffect(() => {
    const updateResponsiveScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 80
        const targetWidth = dimensions?.width || 612
        const responsiveScale = Math.min(1, containerWidth / targetWidth)
        setCurrentScale(scale * responsiveScale)
      }
    }

    updateResponsiveScale()
    window.addEventListener('resize', updateResponsiveScale)
    return () => window.removeEventListener('resize', updateResponsiveScale)
  }, [scale, dimensions])

  /**
   * Show notification
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Sanitize layout HTML and make text elements editable
   */
  const prepareEditableHtml = useCallback((html) => {
    if (!html) return ''

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Find and remove large dark backgrounds
    const allDivs = doc.querySelectorAll('div')
    allDivs.forEach(div => {
      const style = div.getAttribute('style') || ''
      const width = div.style.width ? parseInt(div.style.width) : 0
      const height = div.style.height ? parseInt(div.style.height) : 0

      const hasBlackBg = style.includes('background') &&
        (style.includes('#000') || style.includes('rgb(0') || style.includes('black'))

      if (hasBlackBg && (width > 200 || height > 200)) {
        div.remove()
      }
    })

    // Add editable class to text elements
    const textElements = doc.querySelectorAll('.text-element, [data-text-id]')
    textElements.forEach((el, index) => {
      el.setAttribute('data-editable', 'true')
      el.setAttribute('data-edit-id', `text-${index}`)
      el.classList.add('inline-editable')
    })

    return doc.body.innerHTML
  }, [])

  /**
   * Handle click on editable element
   */
  const handleElementClick = useCallback((e) => {
    const editableEl = e.target.closest('[data-editable="true"]')
    if (editableEl) {
      e.preventDefault()
      e.stopPropagation()

      const editId = editableEl.getAttribute('data-edit-id')
      const currentText = editableEl.textContent || ''

      setEditingElement({
        id: editId,
        element: editableEl,
        originalText: currentText,
        rect: editableEl.getBoundingClientRect()
      })
      setEditedContent(currentText)
    }
  }, [])

  /**
   * Handle content save
   */
  const handleSaveEdit = useCallback(() => {
    if (editingElement && contentRef.current) {
      const el = contentRef.current.querySelector(`[data-edit-id="${editingElement.id}"]`)
      if (el) {
        el.textContent = editedContent
        el.classList.add('content-updated')
        setTimeout(() => el.classList.remove('content-updated'), 300)
      }

      // Update sections if callback provided
      if (onSectionsUpdate) {
        // Find and update the matching section
        const updatedSections = sections.map(section => {
          if (section.content?.includes(editingElement.originalText)) {
            return {
              ...section,
              content: section.content.replace(editingElement.originalText, editedContent)
            }
          }
          return section
        })
        onSectionsUpdate(updatedSections)
      }

      showNotification('Content updated!')
    }
    setEditingElement(null)
    setEditedContent('')
  }, [editingElement, editedContent, sections, onSectionsUpdate, showNotification])

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = useCallback(() => {
    setEditingElement(null)
    setEditedContent('')
  }, [])

  /**
   * Handle AI enhancement for current editing content
   */
  const handleEnhance = useCallback(async () => {
    if (!editedContent.trim()) {
      showNotification('Please add some content first', 'error')
      return
    }

    setIsEnhancing(true)
    try {
      const result = await resumeAPI.enhanceContent({
        content: editedContent,
        sectionType: 'other',
        sectionTitle: 'Content'
      })

      if (result.success && result.data?.enhanced) {
        setEditedContent(result.data.enhanced)
        showNotification('Content enhanced with AI!')
      } else if (result.data?.enhanced) {
        setEditedContent(result.data.enhanced)
        showNotification('Content enhanced!')
      }
    } catch (error) {
      console.error('Enhancement error:', error)
      if (error.response?.data?.data?.enhanced) {
        setEditedContent(error.response.data.data.enhanced)
        showNotification('Content enhanced!')
      } else {
        showNotification('Could not enhance content', 'error')
      }
    } finally {
      setIsEnhancing(false)
    }
  }, [editedContent, showNotification])

  /**
   * Handle change template
   */
  const handleChangeTemplate = useCallback(() => {
    // Navigate to template selection with current resume data
    navigate('/templates', {
      state: {
        fromEditor: true,
        resumeData: resumeData
      }
    })
  }, [navigate, resumeData])

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingElement) {
        if (e.key === 'Escape') {
          handleCancelEdit()
        } else if (e.key === 'Enter' && e.ctrlKey) {
          handleSaveEdit()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editingElement, handleCancelEdit, handleSaveEdit])

  // Click outside to close add panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAddPanel &&
        !e.target.closest('.add-section-floating-panel') &&
        !e.target.closest('.toolbar-btn.add-btn')) {
        setShowAddPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAddPanel])

  return (
    <div className="inline-editable-preview" ref={containerRef}>
      {/* Notification */}
      {notification && (
        <div className={`inline-notification ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '⚠'} {notification.message}
        </div>
      )}

      {/* Floating Toolbar */}
      <div className="floating-toolbar">
        <button
          type="button"
          className="toolbar-btn add-btn"
          onClick={() => setShowAddPanel(!showAddPanel)}
          title="Add Section"
        >
          ➕ Add Section
        </button>
        <button
          type="button"
          className="toolbar-btn template-btn"
          onClick={handleChangeTemplate}
          title="Change Template"
        >
          🎨 Change Template
        </button>
      </div>

      {/* Add Section Floating Panel */}
      {showAddPanel && (
        <AddSectionFloatingPanel
          onAddSection={(section) => {
            onAddSection?.(section)
            setShowAddPanel(false)
            showNotification(`${section.name} section added!`)
          }}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {/* Resume Preview with Inline Editing */}
      <div className="preview-canvas">
        <div className="edit-instructions">
          <span className="instruction-icon">✏️</span>
          <span>Click on any text to edit directly</span>
        </div>

        {layoutHtml ? (
          <div
            className="preview-wrapper"
            style={{
              width: (dimensions?.width || 612) * currentScale,
              minHeight: (dimensions?.height || 792) * currentScale
            }}
          >
            <div
              className="preview-scaler"
              style={{
                transform: `scale(${currentScale})`,
                transformOrigin: 'top left',
                width: dimensions?.width || 612
              }}
            >
              <div
                ref={contentRef}
                className="preview-content editable-content"
                onClick={handleElementClick}
                dangerouslySetInnerHTML={{ __html: prepareEditableHtml(layoutHtml) }}
              />
            </div>
          </div>
        ) : (
          <div className="empty-preview">
            <div className="empty-icon">📄</div>
            <p>No resume content to display</p>
          </div>
        )}
      </div>

      {/* Inline Edit Modal */}
      {editingElement && (
        <div className="inline-edit-modal-overlay" onClick={handleCancelEdit}>
          <div
            className="inline-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edit-modal-header">
              <h3>✏️ Edit Content</h3>
              <button className="close-btn" onClick={handleCancelEdit}>✕</button>
            </div>
            <div className="edit-modal-body">
              <textarea
                className="edit-textarea"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Enter your content..."
                autoFocus
              />
              <div className="edit-tips">
                <span className="tip">💡 Press Ctrl+Enter to save, Esc to cancel</span>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button
                className="enhance-btn"
                onClick={handleEnhance}
                disabled={isEnhancing || !editedContent.trim()}
              >
                {isEnhancing ? (
                  <>
                    <span className="spinner"></span>
                    Enhancing...
                  </>
                ) : (
                  '✨ Enhance with AI'
                )}
              </button>
              <div className="action-btns">
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveEdit}>
                  💾 Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Floating Add Section Panel
 */
function AddSectionFloatingPanel({ onAddSection, onClose }) {
  const [customName, setCustomName] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const QUICK_SECTIONS = [
    { id: 'summary', name: 'Profile Summary', icon: '📝', type: 'summary' },
    { id: 'education', name: 'Education', icon: '🎓', type: 'education' },
    { id: 'experience', name: 'Work Experience', icon: '💼', type: 'experience' },
    { id: 'internship', name: 'Internships', icon: '🏢', type: 'internship' },
    { id: 'projects', name: 'Projects', icon: '🚀', type: 'projects' },
    { id: 'skills', name: 'Skills', icon: '⚡', type: 'skills' },
    { id: 'certifications', name: 'Certifications', icon: '🏆', type: 'certifications' },
    { id: 'achievements', name: 'Achievements', icon: '⭐', type: 'achievements' },
    { id: 'languages', name: 'Languages', icon: '🌐', type: 'other' },
    { id: 'hobbies', name: 'Hobbies', icon: '🎨', type: 'other' },
  ]

  const handleAddCustom = () => {
    if (customName.trim()) {
      onAddSection({
        name: customName.trim(),
        type: 'other',
        isCustom: true
      })
      setCustomName('')
      setShowCustom(false)
    }
  }

  return (
    <div className="add-section-floating-panel" onClick={(e) => e.stopPropagation()}>
      <div className="floating-panel-header">
        <h4>➕ Add Section</h4>
        <button type="button" className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="floating-panel-body">
        <div className="quick-sections">
          {QUICK_SECTIONS.map(section => (
            <button
              type="button"
              key={section.id}
              className="quick-section-btn"
              onClick={() => onAddSection(section)}
            >
              <span className="section-icon">{section.icon}</span>
              <span className="section-name">{section.name}</span>
            </button>
          ))}
        </div>

        <div className="custom-section-area">
          {!showCustom ? (
            <button
              type="button"
              className="add-custom-btn"
              onClick={() => setShowCustom(true)}
            >
              ✏️ Add Custom Section
            </button>
          ) : (
            <div className="custom-input-area">
              <input
                type="text"
                placeholder="Section name..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                autoFocus
              />
              <button
                type="button"
                className="add-btn"
                onClick={handleAddCustom}
                disabled={!customName.trim()}
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InlineEditablePreview
