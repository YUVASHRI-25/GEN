import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import InlineEditablePreview from './InlineEditablePreview'
import './LayoutEditor.css'

/**
 * LayoutEditor Component - Redesigned
 * Now uses inline editing directly on the resume
 * No separate left panel - edit by clicking on resume content
 * 
 * Features:
 * - Direct inline editing on the preserved layout
 * - Floating "Add Section" button
 * - "Change Template" button to switch templates
 */
function LayoutEditor({ 
  initialData, 
  layoutPreserved = true,
  onSave,
  onDownload 
}) {
  const navigate = useNavigate()
  
  // Resume data state
  const [resumeData, setResumeData] = useState({
    title: '',
    sections: [],
    contact: {},
    layoutHtml: '',
    dimensions: null,
    layout: 'single',
    pages: []
  })
  
  // UI state
  const [notification, setNotification] = useState(null)
  const [previewScale, setPreviewScale] = useState(1)

  // Initialize with uploaded data
  useEffect(() => {
    if (initialData) {
      // Transform sections from layout parser to editable format
      const editableSections = transformSections(initialData)
      
      setResumeData({
        title: initialData.title || initialData.semanticSections?.find(s => 
          s.heading?.toLowerCase().includes('name'))?.content?.[0] || 'Resume',
        sections: editableSections,
        contact: initialData.contact || {},
        layoutHtml: initialData.layoutHtml || '',
        dimensions: initialData.dimensions || { width: 612, height: 792 },
        layout: initialData.layout || 'single',
        pages: initialData.pages || []
      })
    }
  }, [initialData])

  /**
   * Transform parsed sections into editable format
   */
  const transformSections = (data) => {
    // Prefer semantic sections if available
    if (data.semanticSections && data.semanticSections.length > 0) {
      return data.semanticSections.map((section, index) => ({
        id: `section-${index}`,
        heading: section.heading || `Section ${index + 1}`,
        content: Array.isArray(section.content) 
          ? section.content.join('\n') 
          : section.content || '',
        type: detectSectionType(section.heading),
        column: section.column || 'left',
        originalY: section.y || 0,
        isCustom: false,
        items: section.items || []
      }))
    }
    
    // Fall back to layout-extracted sections
    if (data.sections && data.sections.length > 0) {
      return data.sections.map((section, index) => ({
        id: `section-${index}`,
        heading: section.heading || `Section ${index + 1}`,
        content: Array.isArray(section.content) 
          ? section.content.join('\n') 
          : section.content || '',
        type: detectSectionType(section.heading),
        column: section.column || 'left',
        originalY: section.y || 0,
        isCustom: false
      }))
    }
    
    return []
  }

  /**
   * Detect section type from heading
   */
  const detectSectionType = (heading) => {
    if (!heading) return 'other'
    const h = heading.toLowerCase()
    
    if (h.includes('summary') || h.includes('profile') || h.includes('about')) return 'summary'
    if (h.includes('education')) return 'education'
    if (h.includes('experience') || h.includes('work') || h.includes('employment')) return 'experience'
    if (h.includes('intern')) return 'internship'
    if (h.includes('project')) return 'projects'
    if (h.includes('skill') || h.includes('technical')) return 'skills'
    if (h.includes('certif') || h.includes('certificate')) return 'certifications'
    if (h.includes('achiev') || h.includes('award') || h.includes('honor')) return 'achievements'
    if (h.includes('contact') || h.includes('header')) return 'header'
    
    return 'other'
  }

  /**
   * Show notification
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Handle sections update from inline editor
   */
  const handleSectionsUpdate = useCallback((updatedSections) => {
    setResumeData(prev => ({
      ...prev,
      sections: updatedSections
    }))
  }, [])

  /**
   * Add new section
   */
  const handleAddSection = useCallback((sectionConfig) => {
    const newSection = {
      id: `section-${Date.now()}`,
      heading: sectionConfig.name,
      content: '',
      type: sectionConfig.type || 'other',
      column: 'left',
      isCustom: sectionConfig.isCustom || false
    }

    setResumeData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
    
    showNotification(`${sectionConfig.name} section added!`)
  }, [showNotification])

  return (
    <div className="layout-editor layout-editor-inline">
      {/* Notification */}
      {notification && (
        <div className={`editor-notification ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '⚠'} {notification.message}
        </div>
      )}

      {/* Main Preview Area with Inline Editing */}
      <InlineEditablePreview
        layoutHtml={resumeData.layoutHtml}
        sections={resumeData.sections}
        dimensions={resumeData.dimensions}
        scale={previewScale}
        onSectionsUpdate={handleSectionsUpdate}
        onAddSection={handleAddSection}
        resumeData={resumeData}
      />

      {/* Layout Preserved Badge */}
      {layoutPreserved && (
        <div className="layout-badge-floating">
          <span className="badge-icon">📐</span>
          <span className="badge-text">Layout Preserved</span>
          <span className="layout-type">
            {resumeData.layout === 'two-column' ? 'Two-column' : 'Single-column'}
          </span>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="zoom-controls-floating">
        <button 
          className={`zoom-btn ${previewScale === 0.75 ? 'active' : ''}`}
          onClick={() => setPreviewScale(0.75)}
        >
          75%
        </button>
        <button 
          className={`zoom-btn ${previewScale === 1 ? 'active' : ''}`}
          onClick={() => setPreviewScale(1)}
        >
          100%
        </button>
        <button 
          className={`zoom-btn ${previewScale === 1.25 ? 'active' : ''}`}
          onClick={() => setPreviewScale(1.25)}
        >
          125%
        </button>
      </div>
    </div>
  )
}

export default LayoutEditor
