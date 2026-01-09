import { useState } from 'react'
import { useResume } from '../../context/ResumeContext'
import { saveResume } from '../../api/resumeApi'
import { resumeAPI } from '../../services/api'

function Projects() {
  const { resumeData, addProject, removeProject } = useResume()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    technologies: '',
    duration: '',
    description: '',
    link: ''
  })
  const [enhancing, setEnhancing] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEnhanceDescription = async () => {
    if (!formData.description || formData.description.trim().length < 10) {
      setError('Please add a basic description first (at least 10 characters)')
      return
    }

    setEnhancing(true)
    setError('')

    try {
      const response = await resumeAPI.enhanceProjectDescription({
        description: formData.description,
        projectName: formData.name,
        technologies: formData.technologies
      })

      if (response.success && response.enhancedDescription) {
        setFormData({
          ...formData,
          description: response.enhancedDescription
        })
        setError('') // Clear any previous errors on success
      } else {
        setError('Could not enhance description. Your current description looks good!')
      }
    } catch (err) {
      console.error('Enhancement error:', err)
      // Provide a helpful fallback message
      setError('💡 AI service unavailable. Try refining your description by adding specific details about technologies used, features implemented, or problems solved.')
    } finally {
      setEnhancing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Project name is required')
      return
    }

    try {
      // Format project data for ATS compatibility
      const newProject = {
        name: formData.name.trim(),
        role: 'Developer', // Default role
        technologies: formData.technologies 
          ? formData.technologies.split(',').map(t => t.trim()).filter(t => t)
          : [],
        duration: formData.duration || 'Present',
        description: formData.description || '',
        link: formData.link || '',
        // Add ATS-friendly fields
        skills: formData.technologies 
          ? formData.technologies.split(',').map(t => t.trim()).filter(t => t)
          : [],
        responsibilities: formData.description 
          ? formData.description.split('\n').filter(line => line.trim() !== '')
          : [],
        achievements: []
      }
      
      console.log('Adding project:', newProject)
      console.log('Current projects before add:', resumeData.projects)
      
      // Add project to the state - this will immediately update the preview
      addProject(newProject)
      
      // Log after add (note: state may not be updated immediately due to React batching)
      setTimeout(() => {
        console.log('Projects after add (delayed):', resumeData.projects)
      }, 100)
      
      // Reset form and hide it
      setFormData({ name: '', technologies: '', duration: '', description: '', link: '' })
      setShowForm(false)
      
      // Note: The project is now saved to localStorage via the context automatically
      // No need to call handleSaveAll here as it was causing timing issues
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', technologies: '', duration: '', description: '', link: '' })
    setShowForm(false)
  }

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      // The projects are already in the resumeData state managed by the context
      // The context's useEffect will automatically save to localStorage
      // If you need to save to a backend, you would do it here
      console.log('Projects saved successfully:', resumeData.projects);
      alert('Projects saved successfully!');
      return { success: true };
    } catch (error) {
      console.error('Failed to save projects:', error);
      alert('Failed to save projects. Please try again.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="tab-section">
      <div className="section-header">
        <div>
          <h2>🚀 Projects</h2>
          <p>Add your academic or personal projects to showcase your skills</p>
        </div>
        {resumeData.projects.length > 0 && (
          <button 
            className="save-all-btn"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Projects'}
          </button>
        )}
      </div>

      {/* Existing Project Entries */}
      {resumeData.projects.length > 0 && (
        <div className="entries-list">
          {resumeData.projects.map((project, index) => (
            <div key={index} className="entry-card">
              <button 
                className="remove-btn"
                onClick={() => removeProject(index)}
              >
                ×
              </button>
              <div className="entry-header">
                <span className="entry-title">{project.name}</span>
                <span className="entry-date">{project.duration}</span>
              </div>
              {project.technologies && project.technologies.length > 0 && (
                <div className="project-tech">
                  {Array.isArray(project.technologies) 
                    ? project.technologies.join(', ')
                    : project.technologies
                  }
                </div>
              )}
              {project.description && (
                <p className="entry-description">{project.description}</p>
              )}
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                  🔗 View Project
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Project Button/Form */}
      {!showForm ? (
        <button 
          className="add-entry-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Project
        </button>
      ) : (
        <form className="entry-form" onSubmit={handleSubmit}>
          <h4>Add Project</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., E-commerce Website"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., Jan 2025 - Mar 2025"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="technologies">Technologies Used (comma separated)</label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, MongoDB"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you built and what you learned...&#10;e.g., Built a full-stack e-commerce website with user authentication and payment integration."
              rows={4}
            />
            <div className="ai-enhance-section">
              <button
                type="button"
                className="ai-enhance-btn"
                onClick={handleEnhanceDescription}
                disabled={enhancing || !formData.description || formData.description.trim().length < 10}
              >
                {enhancing ? '⏳ Enhancing...' : '✨ Enhance with AI'}
              </button>
              {error && <p className="ai-error">{error}</p>}
              {!formData.description && (
                <p className="ai-hint">Add a basic description first to use AI enhancement</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="link">Project Link (optional)</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="e.g., https://github.com/username/project"
            />
          </div>

          <div className="description-tips">
            <strong>💡 Writing Tips:</strong>
            <ul>
              <li>Start with an action verb (Built, Developed, Created)</li>
              <li>Mention specific technologies used</li>
              <li>Include key features or functionality</li>
              <li>Add measurable results if possible (users, performance)</li>
            </ul>
          </div>

          <div className="entry-form-buttons">
            <button 
            type="submit" 
            className="add-btn"
            disabled={isSaving || !formData.name}
          >
            {isSaving ? 'Saving...' : 'Save Project'}
          </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}

      {/* Project Ideas */}
      {resumeData.projects.length === 0 && !showForm && (
        <div className="project-ideas">
          <h4>💡 Project Ideas for First-Year Students:</h4>
          <ul>
            <li><strong>Calculator App</strong> - Simple UI with basic operations</li>
            <li><strong>To-Do List</strong> - CRUD operations, local storage</li>
            <li><strong>Portfolio Website</strong> - HTML, CSS, JavaScript</li>
            <li><strong>Weather App</strong> - API integration</li>
            <li><strong>Quiz Application</strong> - Multiple choice questions</li>
            <li><strong>Student Management System</strong> - Basic database operations</li>
          </ul>
        </div>
      )}

      <div className="tip-box">
        <strong>💡 Tip:</strong> Even small projects count! Class assignments, mini-projects, 
        or self-learning projects all demonstrate your practical skills.
      </div>

      <style>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .save-all-btn {
          background-color: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .save-all-btn:hover {
          background-color: #5a67d8;
        }

        .save-all-btn:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }

        .entries-list {
          margin-bottom: 20px;
        }
        
        .project-tech {
          font-size: 13px;
          color: #667eea;
          margin-top: 4px;
          font-style: italic;
        }
        
        .project-link {
          display: inline-block;
          margin-top: 8px;
          font-size: 13px;
          color: #667eea;
          text-decoration: none;
        }
        
        .project-link:hover {
          text-decoration: underline;
        }
        
        .entry-description {
          margin-top: 8px;
          font-size: 14px;
          color: #555;
          line-height: 1.5;
        }
        
        .add-entry-btn {
          width: 100%;
          padding: 16px;
          background: #f8f9fb;
          border: 2px dashed #ccc;
          border-radius: 12px;
          color: #666;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .add-entry-btn:hover {
          border-color: #667eea;
          color: #667eea;
          background: #667eea08;
        }
        
        .project-ideas {
          margin-top: 24px;
          padding: 20px;
          background: #e3f2fd;
          border-radius: 12px;
          border-left: 4px solid #2196f3;
        }
        
        .project-ideas h4 {
          margin-bottom: 12px;
          color: #1565c0;
        }
        
        .project-ideas ul {
          margin-left: 20px;
          color: #555;
        }
        
        .project-ideas li {
          margin-bottom: 8px;
        }
        
        .project-ideas strong {
          color: #1565c0;
        }
        
        .tip-box {
          margin-top: 24px;
          padding: 16px;
          background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
          border-radius: 8px;
          font-size: 14px;
          color: #555;
        }
        
        .tip-box strong {
          color: #667eea;
        }

        .ai-enhance-section {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ai-enhance-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          align-self: flex-start;
        }

        .ai-enhance-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .ai-enhance-btn:disabled {
          background: #a0aec0;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .ai-error {
          color: #e53e3e;
          font-size: 13px;
          margin: 0;
        }

        .ai-hint {
          color: #718096;
          font-size: 13px;
          margin: 0;
          font-style: italic;
        }

        .description-tips {
          background: #f7fafc;
          border-left: 3px solid #667eea;
          padding: 12px 16px;
          margin-top: 12px;
          border-radius: 4px;
          font-size: 13px;
        }

        .description-tips strong {
          color: #667eea;
          display: block;
          margin-bottom: 8px;
        }

        .description-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .description-tips li {
          margin: 4px 0;
          color: #4a5568;
        }
      `}</style>
    </div>
  )
}

export default Projects
