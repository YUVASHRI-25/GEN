import { useState, useEffect, useCallback, useRef } from 'react'
import { resumeAPI } from '../../services/api'
import EditableSection from './EditableSection'
import LiveLayoutPreview from './LiveLayoutPreview'
import AddSectionPanel from './AddSectionPanel'
import './LayoutEditor.css'

/**
 * LayoutEditor Component
 * Main editor with preserved layout and live preview
 * 
 * Left Panel: Editable sections mapped from resume
 * Right Panel: Live preview maintaining original layout
 */
function LayoutEditor({ 
  initialData, 
  layoutPreserved = true,
  onSave,
  onDownload 
}) {
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
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('sections') // 'sections' | 'add'
  const [isEnhancing, setIsEnhancing] = useState({})
  const [notification, setNotification] = useState(null)
  const [previewScale, setPreviewScale] = useState(1)
  const [editorCollapsed, setEditorCollapsed] = useState(false)
  
  // Refs for live sync
  const previewRef = useRef(null)
  const debounceTimer = useRef(null)

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
   * Update section content - immediate state update
   * Live preview receives updates via props reactively
   */
  const updateSection = useCallback((index, field, value) => {
    setResumeData(prev => {
      const newSections = [...prev.sections]
      newSections[index] = { ...newSections[index], [field]: value }
      return { ...prev, sections: newSections }
    })
  }, [])

  /**
   * Sync content to live preview (kept for backwards compatibility)
   */
  const syncPreview = useCallback((sections) => {
    // Now handled reactively via props
    if (previewRef.current?.updateContent) {
      previewRef.current.updateContent(sections)
    }
  }, [])

  /**
   * Enhance section with AI
   */
  const enhanceSection = useCallback(async (index) => {
    const section = resumeData.sections[index]
    if (!section.content?.trim()) {
      showNotification('Please add some content first', 'error')
      return
    }

    setIsEnhancing(prev => ({ ...prev, [index]: true }))

    try {
      const result = await resumeAPI.enhanceContent({
        content: section.content,
        sectionType: section.type,
        sectionTitle: section.heading
      })

      if (result.success) {
        updateSection(index, 'content', result.data.enhanced)
        showNotification('Content enhanced successfully!')
      } else {
        showNotification(result.message || 'Enhancement failed', 'error')
      }
    } catch (error) {
      console.error('Enhancement error:', error)
      showNotification('Failed to enhance content. AI service may be unavailable.', 'error')
    } finally {
      setIsEnhancing(prev => ({ ...prev, [index]: false }))
    }
  }, [resumeData.sections, updateSection, showNotification])

  /**
   * Delete section
   */
  const deleteSection = useCallback((index) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setResumeData(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }))
      if (activeSectionIndex >= index && activeSectionIndex > 0) {
        setActiveSectionIndex(activeSectionIndex - 1)
      }
      showNotification('Section deleted')
    }
  }, [activeSectionIndex, showNotification])

  /**
   * Move section up/down
   */
  const moveSection = useCallback((index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= resumeData.sections.length) return

    setResumeData(prev => {
      const newSections = [...prev.sections]
      const temp = newSections[index]
      newSections[index] = newSections[newIndex]
      newSections[newIndex] = temp
      return { ...prev, sections: newSections }
    })
    setActiveSectionIndex(newIndex)
  }, [resumeData.sections.length])

  /**
   * Add new section
   */
  const addSection = useCallback((sectionConfig) => {
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
    
    setActiveSectionIndex(resumeData.sections.length)
    setActiveTab('sections')
    showNotification(`${sectionConfig.name} section added`)
  }, [resumeData.sections.length, showNotification])

  /**
   * Get sections that support AI enhancement
   */
  const canEnhance = (type) => {
    return ['summary', 'education', 'experience', 'internship', 'projects'].includes(type)
  }

  return (
    <div className={`layout-editor ${editorCollapsed ? 'editor-collapsed' : ''}`}>
      {/* Notification */}
      {notification && (
        <div className={`editor-notification ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '⚠'} {notification.message}
        </div>
      )}

      {/* Left Panel - Editor Controls */}
      <div className="editor-left-panel">
        <div className="panel-header">
          <h2>Edit Resume</h2>
          <button 
            className="collapse-btn"
            onClick={() => setEditorCollapsed(!editorCollapsed)}
            title={editorCollapsed ? 'Expand Editor' : 'Collapse Editor'}
          >
            {editorCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Tabs */}
        <div className="editor-tabs">
          <button 
            className={`editor-tab ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            📝 Sections
          </button>
          <button 
            className={`editor-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            ➕ Add Section
          </button>
        </div>

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="sections-panel">
            {/* Section Navigation */}
            <div className="section-nav">
              {resumeData.sections.map((section, index) => (
                <button
                  key={section.id}
                  className={`section-nav-btn ${activeSectionIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveSectionIndex(index)}
                >
                  <span className="section-icon">
                    {getSectionIcon(section.type)}
                  </span>
                  <span className="section-title">
                    {section.heading || 'Untitled'}
                  </span>
                  {section.isCustom && (
                    <span className="custom-badge">Custom</span>
                  )}
                </button>
              ))}
            </div>

            {/* Active Section Editor */}
            {resumeData.sections[activeSectionIndex] && (
              <EditableSection
                section={resumeData.sections[activeSectionIndex]}
                sectionIndex={activeSectionIndex}
                totalSections={resumeData.sections.length}
                onUpdate={updateSection}
                onEnhance={enhanceSection}
                onDelete={deleteSection}
                onMove={moveSection}
                isEnhancing={isEnhancing[activeSectionIndex]}
                canEnhance={canEnhance(resumeData.sections[activeSectionIndex].type)}
              />
            )}

            {resumeData.sections.length === 0 && (
              <div className="empty-sections">
                <p>No sections found. Add sections to start editing.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('add')}
                >
                  ➕ Add Section
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Section Tab */}
        {activeTab === 'add' && (
          <AddSectionPanel onAddSection={addSection} />
        )}
      </div>

      {/* Right Panel - Live Preview */}
      <div className="editor-right-panel">
        <div className="preview-header">
          <h3>📋 Live Preview</h3>
          <div className="preview-controls">
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

        <LiveLayoutPreview
          ref={previewRef}
          layoutHtml={resumeData.layoutHtml}
          sections={resumeData.sections}
          dimensions={resumeData.dimensions}
          pages={resumeData.pages}
          scale={previewScale}
          layoutPreserved={layoutPreserved}
        />

        {layoutPreserved && (
          <div className="preview-info">
            <span className="info-badge">
              📐 Layout Preserved
            </span>
            <span className="info-text">
              {resumeData.layout === 'two-column' ? 'Two-column' : 'Single-column'} layout
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Get icon for section type
 */
function getSectionIcon(type) {
  const icons = {
    header: '👤',
    summary: '📝',
    education: '🎓',
    experience: '💼',
    internship: '🏢',
    projects: '🚀',
    skills: '⚡',
    certifications: '🏆',
    achievements: '⭐',
    other: '📄'
  }
  return icons[type] || '📄'
}

export default LayoutEditor
