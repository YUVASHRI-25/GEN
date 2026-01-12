import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { resumeAPI, downloadFile } from '../services/api'
import './ResumeEditor.css'

// Predefined additional section options
const ADDITIONAL_SECTIONS = [
  { id: 'profile-summary', name: 'Profile Summary', icon: '📝' },
  { id: 'career-objective', name: 'Career Objective', icon: '🎯' },
  { id: 'certifications', name: 'Certifications', icon: '🏆' },
  { id: 'achievements', name: 'Achievements', icon: '⭐' },
  { id: 'custom', name: 'Custom Section', icon: '➕' }
]

function ResumeEditor() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [resumeData, setResumeData] = useState({
    title: 'Resume',
    sections: [],
    image: null
  })
  const [activeTab, setActiveTab] = useState('sections')
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [isEnhancing, setIsEnhancing] = useState({})
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('atsTemplate')
  const [isDownloading, setIsDownloading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [customSectionName, setCustomSectionName] = useState('')
  const [notification, setNotification] = useState(null)

  // Load parsed resume data from navigation state
  useEffect(() => {
    if (location.state?.parsedResume) {
      setResumeData(location.state.parsedResume)
    } else {
      // If no data, redirect to upload page
      navigate('/upload-resume')
    }
  }, [location.state, navigate])

  // Fetch available templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const result = await resumeAPI.getTemplates()
        if (result.success) {
          setTemplates(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      }
    }
    fetchTemplates()
  }, [])

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Update section content
  const updateSection = (index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }))
  }

  // Enhance section with AI
  const enhanceSection = async (index) => {
    const section = resumeData.sections[index]
    if (!section.content?.trim()) {
      showNotification('Please add some content first', 'error')
      return
    }

    setIsEnhancing(prev => ({ ...prev, [index]: true }))

    try {
      const result = await resumeAPI.enhanceContent({
        content: section.content,
        sectionType: section.heading,
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
      showNotification('Failed to enhance content', 'error')
    } finally {
      setIsEnhancing(prev => ({ ...prev, [index]: false }))
    }
  }

  // Delete section
  const deleteSection = (index) => {
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
  }

  // Add new section
  const addSection = (sectionType) => {
    let newSection = { heading: '', content: '' }

    if (sectionType.id === 'custom') {
      if (!customSectionName.trim()) {
        showNotification('Please enter a section name', 'error')
        return
      }
      newSection.heading = customSectionName.trim()
      setCustomSectionName('')
    } else {
      newSection.heading = sectionType.name
    }

    setResumeData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
    setShowAddSection(false)
    setActiveSectionIndex(resumeData.sections.length)
    setActiveTab('sections')
    showNotification(`${newSection.heading} section added`)
  }

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        setResumeData(prev => ({ ...prev, image: base64 }))
        showNotification('Image uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove profile image
  const removeImage = () => {
    setResumeData(prev => ({ ...prev, image: null }))
    showNotification('Image removed')
  }

  // Download PDF
  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const blob = await resumeAPI.downloadPDF({
        resumeData: resumeData,
        templateId: selectedTemplate
      })
      
      const filename = `${resumeData.title || 'Resume'}.pdf`
      downloadFile(blob, filename)
      showNotification('Resume downloaded successfully!')
      setShowTemplateModal(false)
    } catch (error) {
      console.error('Download error:', error)
      showNotification('Failed to download resume', 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  // Move section up/down
  const moveSection = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= resumeData.sections.length) return

    const newSections = [...resumeData.sections]
    const temp = newSections[index]
    newSections[index] = newSections[newIndex]
    newSections[newIndex] = temp

    setResumeData(prev => ({ ...prev, sections: newSections }))
    setActiveSectionIndex(newIndex)
  }

  return (
    <div className="resume-editor-page">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/upload-resume')}>
            ← Back
          </button>
          <input
            type="text"
            className="resume-title-input"
            value={resumeData.title}
            onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Resume Title"
          />
        </div>
        <div className="header-right">
          <button 
            className="btn btn-primary download-btn"
            onClick={() => setShowTemplateModal(true)}
          >
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-main">
        {/* Left Panel - Sections Editor */}
        <div className="editor-panel left-panel">
          {/* Tabs */}
          <div className="panel-tabs">
            <button 
              className={`tab ${activeTab === 'sections' ? 'active' : ''}`}
              onClick={() => setActiveTab('sections')}
            >
              📄 Sections
            </button>
            <button 
              className={`tab ${activeTab === 'add-more' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-more')}
            >
              ➕ Add More
            </button>
          </div>

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="sections-editor">
              {/* Profile Image Section */}
              <div className="image-section">
                <h4>Profile Image</h4>
                {resumeData.image ? (
                  <div className="image-preview">
                    <img 
                      src={`data:image/jpeg;base64,${resumeData.image}`} 
                      alt="Profile" 
                    />
                    <div className="image-actions">
                      <label className="btn btn-small btn-secondary">
                        Replace
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          hidden 
                        />
                      </label>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={removeImage}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="image-upload-btn">
                    <span>📷 Add Profile Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      hidden 
                    />
                  </label>
                )}
              </div>

              {/* Section Navigation */}
              <div className="sections-nav">
                {resumeData.sections.map((section, index) => (
                  <button
                    key={index}
                    className={`section-nav-item ${activeSectionIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveSectionIndex(index)}
                  >
                    <span className="section-nav-title">{section.heading || 'Untitled'}</span>
                    <span className="section-nav-preview">
                      {section.content?.substring(0, 30)}...
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Section Editor */}
              {resumeData.sections[activeSectionIndex] && (
                <div className="section-editor">
                  <div className="section-header">
                    <input
                      type="text"
                      className="section-heading-input"
                      value={resumeData.sections[activeSectionIndex].heading}
                      onChange={(e) => updateSection(activeSectionIndex, 'heading', e.target.value)}
                      placeholder="Section Heading"
                    />
                    <div className="section-actions">
                      <button 
                        className="action-btn"
                        onClick={() => moveSection(activeSectionIndex, 'up')}
                        disabled={activeSectionIndex === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => moveSection(activeSectionIndex, 'down')}
                        disabled={activeSectionIndex === resumeData.sections.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => deleteSection(activeSectionIndex)}
                        title="Delete Section"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="section-content-input"
                    value={resumeData.sections[activeSectionIndex].content}
                    onChange={(e) => updateSection(activeSectionIndex, 'content', e.target.value)}
                    placeholder="Enter section content..."
                    rows={12}
                  />

                  <button 
                    className="btn btn-enhance"
                    onClick={() => enhanceSection(activeSectionIndex)}
                    disabled={isEnhancing[activeSectionIndex]}
                  >
                    {isEnhancing[activeSectionIndex] ? (
                      <>
                        <span className="spinner"></span>
                        Enhancing...
                      </>
                    ) : (
                      <>✨ Enhance with AI</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add More Tab */}
          {activeTab === 'add-more' && (
            <div className="add-more-tab">
              <h3>Add More Information</h3>
              <p>Select a section type to add to your resume</p>
              
              <div className="additional-sections-grid">
                {ADDITIONAL_SECTIONS.map((section) => (
                  <div key={section.id} className="additional-section-card">
                    {section.id === 'custom' ? (
                      <>
                        <div className="section-card-header">
                          <span className="section-icon">{section.icon}</span>
                          <span className="section-name">{section.name}</span>
                        </div>
                        <input
                          type="text"
                          className="custom-section-input"
                          placeholder="Enter section name..."
                          value={customSectionName}
                          onChange={(e) => setCustomSectionName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSection(section)}
                        />
                        <button 
                          className="btn btn-small btn-primary"
                          onClick={() => addSection(section)}
                        >
                          Add Section
                        </button>
                      </>
                    ) : (
                      <button 
                        className="section-card-btn"
                        onClick={() => addSection(section)}
                      >
                        <span className="section-icon">{section.icon}</span>
                        <span className="section-name">{section.name}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        <div className="editor-panel right-panel">
          <div className="preview-header">
            <h3>📋 Live Preview</h3>
          </div>
          <div className="resume-preview">
            <div className="preview-content">
              {/* Profile Image */}
              {resumeData.image && (
                <div className="preview-image">
                  <img 
                    src={`data:image/jpeg;base64,${resumeData.image}`} 
                    alt="Profile" 
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="preview-title">{resumeData.title}</h1>

              {/* Sections */}
              {resumeData.sections.map((section, index) => (
                <div key={index} className="preview-section">
                  <h2 className="preview-section-heading">{section.heading}</h2>
                  <div className="preview-section-content">
                    {section.content?.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Template</h2>
              <button className="modal-close" onClick={() => setShowTemplateModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="template-grid">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="template-preview">
                      <div className="template-icon">📄</div>
                    </div>
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeEditor
