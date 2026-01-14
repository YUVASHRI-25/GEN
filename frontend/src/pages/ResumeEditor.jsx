import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { resumeAPI, downloadFile } from '../services/api'
import { LayoutEditor } from '../components/LayoutEditor'
import './ResumeEditor.css'

/**
 * ResumeEditor Page
 * Main page for editing resumes with preserved layout and live preview
 */
function ResumeEditor() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Resume data from upload
  const [resumeData, setResumeData] = useState(null)
  const [layoutPreserved, setLayoutPreserved] = useState(false)
  const [originalFilename, setOriginalFilename] = useState('')
  
  // UI State
  const [resumeTitle, setResumeTitle] = useState('My Resume')
  const [isDownloading, setIsDownloading] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [notification, setNotification] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load data from navigation state
  useEffect(() => {
    if (location.state?.parsedResume) {
      const parsed = location.state.parsedResume
      setResumeData(parsed)
      setLayoutPreserved(location.state.layoutPreserved || false)
      setOriginalFilename(location.state.originalFilename || 'resume')
      
      // Set title from parsed data
      if (parsed.title) {
        setResumeTitle(parsed.title)
      } else if (parsed.contact?.name) {
        setResumeTitle(`${parsed.contact.name}'s Resume`)
      }
    } else {
      // No data - redirect to upload
      navigate('/upload-resume')
    }
  }, [location.state, navigate])

  /**
   * Show notification
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Handle resume save  
   */
  const handleSave = useCallback(async (data) => {
    setIsSaving(true)
    try {
      // In a real app, save to backend/database
      showNotification('Resume saved successfully!')
    } catch (error) {
      showNotification('Failed to save resume', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [showNotification])

  /**
   * Handle PDF download
   */
  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      const downloadData = {
        resumeData: resumeData,
        templateId: 'originalFormat',
        layoutPreserved: layoutPreserved
      }
      
      const blob = await resumeAPI.downloadPDF(downloadData)
      const filename = `${resumeTitle || 'Resume'}.pdf`
      downloadFile(blob, filename)
      
      showNotification('Resume downloaded successfully!')
      setShowDownloadModal(false)
    } catch (error) {
      console.error('Download error:', error)
      showNotification('Failed to download resume', 'error')
    } finally {
      setIsDownloading(false)
    }
  }, [resumeData, resumeTitle, layoutPreserved, showNotification])

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (window.confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
      navigate('/upload-resume')
    }
  }

  // Show loading state while data loads
  if (!resumeData) {
    return (
      <div className="resume-editor-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your resume...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="resume-editor-page">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '⚠'} {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
          <input
            type="text"
            className="resume-title-input"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            placeholder="Resume Title"
          />
          {layoutPreserved && (
            <span className="layout-badge">
              📐 Layout Preserved
            </span>
          )}
        </div>
        <div className="header-right">
          <button 
            className="btn btn-secondary save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
          <button 
            className="btn btn-primary download-btn"
            onClick={() => setShowDownloadModal(true)}
          >
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <LayoutEditor 
        initialData={resumeData}
        layoutPreserved={layoutPreserved}
        onSave={handleSave}
        onDownload={() => setShowDownloadModal(true)}
      />

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="modal-overlay" onClick={() => setShowDownloadModal(false)}>
          <div className="modal download-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Download Resume</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowDownloadModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="download-options">
                <div className="download-option selected">
                  <div className="option-icon">📐</div>
                  <div className="option-content">
                    <h4>Preserved Layout</h4>
                    <p>Download with original layout, styling, and formatting</p>
                  </div>
                  <div className="option-check">✓</div>
                </div>
                
                <div className="download-info">
                  <p>
                    <strong>File:</strong> {resumeTitle || 'Resume'}.pdf
                  </p>
                  <p>
                    <strong>Format:</strong> {resumeData?.layout === 'two-column' ? 'Two-column' : 'Single-column'}
                  </p>
                  <p>
                    <strong>Pages:</strong> {resumeData?.pageCount || 1}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDownloadModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  '📥 Download PDF'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeEditor
