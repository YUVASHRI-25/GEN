import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import './UploadResume.css'

function UploadResume() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    validateAndSetFile(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    validateAndSetFile(file)
  }

  const validateAndSetFile = (file) => {
    setError('')
    
    if (!file) return

    // Check file type
    const fileExt = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'doc'].includes(fileExt) && !acceptedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file')
      return
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const result = await resumeAPI.uploadResume(selectedFile)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        // Navigate to editor with parsed data
        navigate('/resume-editor', { 
          state: { 
            parsedResume: result.data,
            originalFilename: selectedFile.name
          } 
        })
      } else {
        setError(result.message || 'Failed to process resume')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="upload-resume-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Upload Your Resume</h1>
          <p>Upload your existing resume and enhance it with AI-powered suggestions</p>
        </div>

        <div 
          className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!selectedFile ? handleBrowseClick : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileSelect}
            hidden
          />

          {!selectedFile ? (
            <>
              <div className="upload-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
              <h3>Drag & Drop your resume here</h3>
              <p>or <span className="browse-link">browse</span> to choose a file</p>
              <div className="supported-formats">
                <span>Supported formats: PDF, DOCX</span>
                <span>Maximum size: 10MB</span>
              </div>
            </>
          ) : (
            <div className="selected-file">
              <div className="file-icon">
                {selectedFile.name.endsWith('.pdf') ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#e74c3c">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6M9 15h6M9 11h6" stroke="#fff" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#2980b9">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6M9 15h6M9 11h6" stroke="#fff" strokeWidth="1.5"/>
                  </svg>
                )}
              </div>
              <div className="file-info">
                <h4>{selectedFile.name}</h4>
                <p>{formatFileSize(selectedFile.size)}</p>
              </div>
              <button 
                className="remove-file-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="upload-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="progress-text">
              {uploadProgress < 100 ? 'Processing your resume...' : 'Almost done...'}
            </span>
          </div>
        )}

        <div className="upload-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            ← Back
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Processing...' : 'Upload & Continue'}
          </button>
        </div>

        <div className="upload-tips">
          <h4>💡 Tips for best results:</h4>
          <ul>
            <li>Use a well-structured resume with clear section headings</li>
            <li>Ensure text is selectable (not scanned images)</li>
            <li>Remove any password protection from the file</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UploadResume
