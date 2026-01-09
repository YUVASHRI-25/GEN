import { useMemo, useState, useEffect } from 'react'
import { useResume } from '../context/ResumeContext'
import { resumeAPI } from '../services/api'
import ResumePreview from '../components/ResumePreview'
import { TEMPLATES, DEFAULT_TEMPLATE_ID } from '../templates'

// Builder Tab Components
import Contact from './Builder/Contact'
import Skills from './Builder/Skills'
import Education from './Builder/Education'
import Projects from './Builder/Projects'
import Internship from './Builder/Internship'
import Certificates from './Builder/Certificates'
import Summary from './Builder/Summary'
import Additional from './Builder/Additional'

import './Builder.css'

const TABS = [
  { id: 'contact', label: 'Contact', icon: '👤' },
  { id: 'skills', label: 'Skills', icon: '💡' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'internship', label: 'Internship', icon: '💼' },
  { id: 'certificates', label: 'Certificates', icon: '📜' },
  { id: 'summary', label: 'Summary', icon: '📝' },
  { id: 'additional', label: 'Additional', icon: '➕' }
]

function Builder() {
  const { resumeData, selectedTemplate, selectedTemplateData, setSelectedTemplate, setSelectedTemplateData } = useResume()
  const [activeTab, setActiveTab] = useState('contact')
  const [generating, setGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState(null)
  const [error, setError] = useState('')
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2)) // Max zoom 200%
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5)) // Min zoom 50%
  }

  const handleZoomReset = () => {
    setZoomLevel(1) // Reset to 100%
  }

  // Ensure a template is loaded/selected
  useEffect(() => {
    if (!selectedTemplate) {
      setSelectedTemplate(DEFAULT_TEMPLATE_ID)
      const fallbackTemplate = TEMPLATES.find(t => t.id === DEFAULT_TEMPLATE_ID)
      setSelectedTemplateData(fallbackTemplate || null)
    } else if (!selectedTemplateData) {
      const template = TEMPLATES.find(t => t.id === selectedTemplate)
      if (template) {
        setSelectedTemplateData(template)
      }
    }
  }, [selectedTemplate, selectedTemplateData, setSelectedTemplate, setSelectedTemplateData])

  const activeTemplate = useMemo(() => {
    if (selectedTemplateData) return selectedTemplateData
    return TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES.find(t => t.id === DEFAULT_TEMPLATE_ID)
  }, [selectedTemplateData, selectedTemplate])

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab)

  const goToNextTab = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id)
    }
  }

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id)
    }
  }

  const handleGenerateResume = async () => {
    setError('')
    setGenerating(true)

    try {
      const response = await resumeAPI.generate(resumeData)
      if (response.success) {
        setGeneratedResume(response.data)
        alert('Resume generated successfully! Click Download PDF to save.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate resume. You can still download using the PDF button.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the resume content
    const resumeContent = document.getElementById('resume-to-print').outerHTML;
    
    // Create a print stylesheet
    const printStyles = `
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 1.6cm;
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.5;
        }
        .resume-paper {
          background: white;
          padding: 40px;
          box-shadow: none;
        }
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          border-bottom: 1px solid #000;
          margin: 20px 0 10px 0;
        }
        .resume-name {
          font-size: 22pt;
          margin: 0 0 10px 0;
        }
        .resume-job-title {
          font-size: 14pt;
          margin-bottom: 10px;
        }
        .contact-info {
          margin-bottom: 20px;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .skill-item {
          background: #f5f5f5;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10pt;
        }
      </style>
    `;
    
    // Write the content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Resume - ${resumeData.contact.name || 'My Resume'}</title>
          ${printStyles}
        </head>
        <body>
          ${resumeContent}
          <script>
            // Print and close the window after loading
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contact':
        return <Contact />
      case 'skills':
        return <Skills />
      case 'education':
        return <Education />
      case 'projects':
        return <Projects />
      case 'internship':
        return <Internship />
      case 'certificates':
        return <Certificates />
      case 'summary':
        return <Summary />
      case 'additional':
        return <Additional />
      default:
        return <Contact />
    }
  }

  return (
    <div className="builder-page">
      <div className="builder-container">
        {/* Left Side - Form */}
        <div className="builder-form-section">
          {/* Tab Navigation */}
          <div className="tabs-navigation">
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
                {index < TABS.length - 1 && <span className="tab-arrow">→</span>}
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentTabIndex + 1) / TABS.length) * 100}%` }}
            ></div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="nav-buttons">
            <button 
              className="btn btn-secondary"
              onClick={goToPrevTab}
              disabled={currentTabIndex === 0}
            >
              ← Previous
            </button>

            {currentTabIndex === TABS.length - 1 ? (
              <div className="final-buttons">
                <button 
                  className="btn btn-primary generate-btn"
                  onClick={handleGenerateResume}
                  disabled={generating}
                >
                  {generating ? '⏳ Generating...' : '🚀 Generate Resume'}
                </button>
                <button 
                  className="btn btn-download"
                  onClick={handleDownloadPDF}
                  title="Download as PDF"
                >
                  📥 Download PDF
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={goToNextTab}
              >
                Next →
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Right Side - Preview */}
        <div className="builder-preview-section">
          <div className="preview-header">
            <h3 className="preview-title">📄 Live Preview</h3>
            <div className="zoom-controls">
              <button 
                className="zoom-btn" 
                onClick={handleZoomOut}
                title="Zoom Out"
                disabled={zoomLevel <= 0.5}
              >
                ➖
              </button>
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
              <button 
                className="zoom-btn" 
                onClick={handleZoomIn}
                title="Zoom In"
                disabled={zoomLevel >= 2}
              >
                ➕
              </button>
              <button 
                className="zoom-reset" 
                onClick={handleZoomReset}
                title="Reset Zoom"
                disabled={zoomLevel === 1}
              >
                🔄
              </button>
            </div>
          </div>
          <ResumePreview zoomLevel={zoomLevel} template={activeTemplate} />
        </div>
      </div>
    </div>
  )
}

export default Builder
