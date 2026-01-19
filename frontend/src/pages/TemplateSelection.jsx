import { useNavigate, useLocation } from 'react-router-dom'
import ResumePreview from '../components/ResumePreview'
import { useResume } from '../context/ResumeContext'
import { TEMPLATES, DEFAULT_TEMPLATE_ID } from '../templates'
import './TemplateSelection.css'

function TemplateSelection() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSelectedTemplate, setSelectedTemplateData } = useResume()

  // Check if coming from editor with resume data
  const fromEditor = location.state?.fromEditor
  const existingResumeData = location.state?.resumeData

  const handleSelect = (template) => {
    setSelectedTemplate(template.id)
    setSelectedTemplateData(template)
    
    // If coming from editor, go back to editor with the new template
    if (fromEditor && existingResumeData) {
      navigate('/resume-editor', { 
        state: { 
          parsedResume: existingResumeData,
          layoutPreserved: true,
          selectedTemplate: template
        }
      })
    } else {
      navigate('/builder')
    }
  }

  return (
    <div className="template-page">
      <div className="template-header">
        <div>
          <p className="eyebrow">{fromEditor ? 'Change Template' : 'Choose Your Style'}</p>
          <h1>{fromEditor ? 'Select a New Template' : 'Select a Resume Template'}</h1>
          <p className="subhead">
            {fromEditor 
              ? 'Choose a different template for your resume. Your content will be preserved.'
              : 'Pick a template to see the full layout with sample data. The same design will be used in the editor and final resume.'
            }
          </p>
        </div>
        {!fromEditor && (
          <div className="info-box">
            <p>How it works</p>
            <ol>
              <li>Preview the templates with dummy data</li>
              <li>Select one template</li>
              <li>Fill your details in the editor — design stays fixed</li>
            </ol>
          </div>
        )}
        {fromEditor && (
          <button 
            className="back-to-editor-btn"
            onClick={() => navigate(-1)}
          >
            ← Back to Editor
          </button>
        )}
      </div>

      <div className="template-grid">
        {TEMPLATES.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-meta">
              <div>
                <p className="eyebrow">Layout: {template.layout?.type === 'two-column' ? 'Two Column' : 'Single Column'}</p>
                <h3>{template.name}</h3>
                <p className="description">{template.description}</p>
              </div>
              <button
                className="select-btn"
                onClick={() => handleSelect(template)}
              >
                {fromEditor ? 'Apply Template' : 'Select Template'}
              </button>
            </div>

            <div className="template-preview-wrapper">
              <ResumePreview
                zoomLevel={0.7}
                template={template}
                dataOverride={template.dummyData}
              />
            </div>
          </div>
        ))}
      </div>

      {!fromEditor && (
        <div className="footer-actions">
          <button
            className="btn-secondary"
            onClick={() => handleSelect(TEMPLATES.find(t => t.id === DEFAULT_TEMPLATE_ID) || TEMPLATES[0])}
          >
            Skip & use first template
          </button>
        </div>
      )}
    </div>
  )
}

export default TemplateSelection

