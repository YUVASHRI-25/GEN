import { useMemo, useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { TEMPLATES } from '../templates'
import './ResumePreview.css'

function ResumePreview({ zoomLevel = 1, template: propTemplate, dataOverride }) {
  const { resumeData, selectedTemplate, setSelectedTemplate, setSelectedTemplateData } = useResume()
  const data = dataOverride || resumeData
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  
  // Use propTemplate if provided, otherwise use the selected template
  const template = propTemplate || selectedTemplateData
  const {
    contact = {},
    summary,
    skills = [],
    education = [],
    projects = [],
    workExperience = [],
    internship = [],
    certificates = [],
    certifications = [],
    languages = [],
    customSections = []
  } = data

  console.log('ResumePreview - projects:', projects)
  console.log('ResumePreview - full data:', data)

  const normalizedWork = workExperience.length ? workExperience : []
  const normalizedInternships = internship.length ? internship : []

  const theme = template?.theme || {}
  const sectionsOrder = template?.sections || [
    'contact',
    'summary',
    'skills',
    'education',
    'projects',
    'internship',
    'certificates',
    'languages',
    'customSections'
  ]

  const containerStyle = useMemo(
    () => ({
      fontFamily: theme.fontFamily || "'Times New Roman', serif",
      background: theme.background || '#fff',
      color: theme.primary || '#000',
      padding: theme.padding || '40px',
      lineHeight: theme.lineHeight || '1.5',
    }),
    [theme]
  )

  const zoomStyle = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease-in-out',
    width: `${100 / zoomLevel}%`,
    margin: '0 auto',
    height: 'fit-content',
    padding: '20px 0'
  }

  const handleTemplateChange = (templateId) => {
    const newTemplate = TEMPLATES.find(t => t.id === templateId)
    if (newTemplate) {
      setSelectedTemplate(templateId)
      setSelectedTemplateData(newTemplate)
    }
    setShowTemplateSelector(false)
  }

  const renderContact = () => {
    // Define basic contact fields (email, phone, location)
    const basicContactFields = [
      { 
        key: 'email', 
        label: contact.email,
        url: contact.email ? `mailto:${contact.email}` : null
      },
      { 
        key: 'phone', 
        label: contact.phone,
        url: contact.phone ? `tel:${contact.phone.replace(/[^0-9+]/g, '')}` : null
      },
      { 
        key: 'location', 
        label: contact.location 
      },
    ].filter(item => item.label);

    // Define social/website links
    const socialLinks = [
      { 
        key: 'linkedin', 
        url: contact.linkedin ? (contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`) : null
      },
      { 
        key: 'github', 
        url: contact.github ? (contact.github.startsWith('http') ? contact.github : `https://${contact.github}`) : null
      },
      { 
        key: 'leetcode', 
        url: contact.leetcode ? (contact.leetcode.startsWith('http') ? contact.leetcode : `https://${contact.leetcode}`) : null
      },
      { 
        key: 'portfolio', 
        url: contact.portfolio ? (contact.portfolio.startsWith('http') ? contact.portfolio : `https://${contact.portfolio}`) : null
      },
      { 
        key: 'website', 
        url: contact.website ? (contact.website.startsWith('http') ? contact.website : `https://${contact.website}`) : null
      },
    ].filter(item => item.url);

    // Add isLast flag to basic contact items
    const contactItems = basicContactFields.map((item, index) => ({
      ...item,
      isLast: index === basicContactFields.length - 1
    }));

    return (
      <header
        className="resume-header"
        style={{
          marginBottom: theme.sectionSpacing || '16px',
          borderBottom: `1px solid ${theme.divider || '#333'}`,
          paddingBottom: '12px',
          textAlign: 'center'
        }}
      >
        <h1
          className="resume-name"
          style={{
            fontSize: theme.nameSize || '22px',
            fontWeight: theme.weightBold || 700,
            textTransform: 'uppercase',
            color: theme.primary || '#000',
            marginBottom: '4px',
          }}
        >
          {contact.name || 'Your Name'}
        </h1>
        {contact.jobTitle && (
          <div
            className="resume-job-title"
            style={{
              fontSize: theme.jobSize || '12px',
              color: theme.secondary || '#555',
              marginBottom: '12px',
              fontWeight: 500,
            }}
          >
            {contact.jobTitle}
          </div>
        )}
        <div
          className="contact-info"
          style={{
            fontSize: theme.bodySize || '10px',
            color: theme.secondary || '#333',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 12px',
            alignItems: 'center',
          }}
        >
          {contactItems.map((item, idx) => (
            <div key={item.key}>
              {item.url ? (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: theme.accent || '#2563eb',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              {!item.isLast && (
                <span style={{ color: '#ccc', marginLeft: '8px' }}>•</span>
              )}
            </div>
          ))}
          
          {/* Social Links Section */}
          {socialLinks.length > 0 && (
            <div style={{ width: '100%', marginTop: '8px' }}>
              <div style={{ 
                fontSize: theme.bodySize || '10px',
                fontWeight: 600,
                color: theme.primary || '#000',
                marginBottom: '4px'
              }}>
                WEBSITES & SOCIAL LINKS:
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '8px 12px',
                justifyContent: 'center'
              }}>
                {socialLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      color: theme.accent || '#2563eb',
                      textDecoration: 'none',
                      fontSize: theme.bodySize || '10px',
                    }}
                  >
                    {item.url.replace(/^https?:\/\//, '')}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
    )
  }

  const renderSectionTitle = (title) => (
    <h2
      className="section-title"
      style={{
        fontSize: theme.sectionSize || '12px',
        fontWeight: theme.weightBold || 700,
        textTransform: 'uppercase',
        borderBottom: `1px solid ${theme.divider || '#333'}`,
        paddingBottom: '4px',
        marginBottom: '8px',
        color: theme.primary || '#000',
      }}
    >
      {title}
    </h2>
  )

  const renderSkills = () => (
    <section
      className="resume-section"
      style={{ marginBottom: theme.sectionSpacing || '14px' }}
    >
      {renderSectionTitle('Skills')}
      <ul
        className="skills-list"
        style={{
          display: 'grid',
          gridTemplateColumns: template?.theme?.skillsColumns
            ? `repeat(${template.theme.skillsColumns}, minmax(0,1fr))`
            : 'repeat(2, minmax(0,1fr))',
          gap: '8px 12px',
          padding: 0,
          listStyle: 'none',
        }}
      >
        {skills.map((skill, index) => {
          const proficiencyMap = {
            // Number levels (1-5)
            1: 'Beginner',
            2: 'Basic',
            3: 'Intermediate',
            4: 'Advanced',
            5: 'Expert',
            // String levels (for backward compatibility)
            'Beginner': 'Beginner',
            'Basic': 'Basic',
            'Intermediate': 'Intermediate',
            'Advanced': 'Advanced',
            'Expert': 'Expert',
            'None': 'None'
          };
          
          // Handle both string and object skill formats
          const skillName = typeof skill === 'string' ? skill : skill.name || '';
          const skillLevel = typeof skill === 'object' ? skill.level : 'Intermediate'; // Default to Intermediate if not specified
          
          // Get the level text, defaulting to empty string if not found
          const levelText = proficiencyMap[skillLevel] ? ` (${proficiencyMap[skillLevel]})` : '';
            
          return (
            <li
              key={index}
              className="skill-item"
              style={{
                background: 'transparent',
                padding: 0,
                fontSize: theme.bodySize || '10px',
                color: theme.primary || '#000',
              }}
            >
              {template?.theme?.bullet || '•'} {skillName}{levelText}
            </li>
          );
        })}
      </ul>
    </section>
  )

  const renderEducation = () => (
    <section
      className="resume-section"
      style={{ marginBottom: theme.sectionSpacing || '14px' }}
    >
      {renderSectionTitle('Education')}
      {education.map((edu, index) => (
        <div
          key={index}
          className="education-item"
          style={{ marginBottom: theme.itemSpacing || '10px' }}
        >
          <div className="item-header">
            <strong style={{ fontSize: theme.bodySize || '11px' }}>{edu.degree}</strong>
            <span className="item-date" style={{ fontSize: theme.bodySize || '10px' }}>
              {edu.year || edu.yearRange}
            </span>
          </div>
          <div className="item-subtitle" style={{ fontSize: theme.bodySize || '10px' }}>
            {edu.institution || edu.college}
          </div>
          {edu.gpa && (
            <div className="item-detail" style={{ fontSize: theme.bodySize || '10px' }}>
              GPA: {edu.gpa}
            </div>
          )}
        </div>
      ))}
    </section>
  )

  const renderProjects = () => {
    console.log('renderProjects called, projects:', projects)
    if (!projects || projects.length === 0) {
      console.log('No projects to render')
      return null
    }
    
    return (
      <section
        className="resume-section"
        style={{ marginBottom: theme.sectionSpacing || '14px' }}
      >
        {renderSectionTitle('Projects')}
        {projects.map((project, index) => (
          <div key={index} className="project-item" style={{ marginBottom: theme.itemSpacing || '10px' }}>
            <div className="item-header">
              <strong style={{ fontSize: theme.bodySize || '11px' }}>{project.name}</strong>
              <span className="item-date" style={{ fontSize: theme.bodySize || '10px' }}>
                {project.duration}
              </span>
            </div>
            {project.technologies && (
              <div className="item-tech" style={{ fontSize: theme.bodySize || '10px' }}>
                {Array.isArray(project.technologies)
                  ? project.technologies.join(', ')
                  : project.technologies}
              </div>
            )}
            {project.description && (
              <p className="item-description" style={{ fontSize: theme.bodySize || '10px' }}>
                {project.description}
              </p>
            )}
          </div>
        ))}
      </section>
    )
  }

  const renderWork = (list, heading = 'Work Experience') => (
    <section
      className="resume-section"
      style={{ marginBottom: theme.sectionSpacing || '14px' }}
    >
      {renderSectionTitle(heading)}
      {list.map((exp, index) => (
        <div key={index} className="experience-item" style={{ marginBottom: theme.itemSpacing || '10px' }}>
          <div className="item-header">
            <strong style={{ fontSize: theme.bodySize || '11px' }}>{exp.position || exp.title}</strong>
            <span className="item-date" style={{ fontSize: theme.bodySize || '10px' }}>
              {exp.duration}
            </span>
          </div>
          <div className="item-subtitle" style={{ fontSize: theme.bodySize || '10px' }}>
            {exp.company}
          </div>
          {exp.description && (
            <p className="item-description" style={{ fontSize: theme.bodySize || '10px' }}>
              {exp.description}
            </p>
          )}
          {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
            <ul style={{ marginLeft: '16px', marginTop: '6px' }}>
              {exp.bullets.map((b, i) => (
                <li key={i} style={{ fontSize: theme.bodySize || '10px' }}>
                  {(theme.bullet || '•') + ' '}{b}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  )

  const renderSummary = () => (
    <section
      className="resume-section"
      style={{ marginBottom: theme.sectionSpacing || '14px' }}
    >
      {renderSectionTitle('Profile')}
      <p className="summary-text" style={{ fontSize: theme.bodySize || '11px' }}>
        {summary}
      </p>
    </section>
  )

  const renderCertifications = () => {
    const list = certificates.length > 0 ? certificates : certifications
    if (!list || list.length === 0) return null
    return (
      <section
        className="resume-section"
        style={{ marginBottom: theme.sectionSpacing || '14px' }}
      >
        {renderSectionTitle('Certifications')}
        <ul style={{ marginLeft: '16px' }}>
          {list.map((cert, index) => (
            <li key={index} style={{ fontSize: theme.bodySize || '10px' }}>
              {typeof cert === 'string' ? cert : cert.name}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const renderLanguages = () => (
    <section
      className="resume-section"
      style={{ marginBottom: theme.sectionSpacing || '14px' }}
    >
      {renderSectionTitle('Languages')}
      <div className="languages-list" style={{ fontSize: theme.bodySize || '10px' }}>
        {languages.map((lang, index) => (
          <span key={index} className="language-item-preview">
            {lang.name} ({lang.proficiency})
            {index < languages.length - 1 && ', '}
          </span>
        ))}
      </div>
    </section>
  )

  const renderCustom = () =>
    customSections.map((section, index) => (
      <section
        key={index}
        className="resume-section"
        style={{ marginBottom: theme.sectionSpacing || '14px' }}
      >
        {renderSectionTitle(section.title)}
        <p className="custom-content" style={{ fontSize: theme.bodySize || '11px' }}>
          {section.content}
        </p>
      </section>
    ))

  const renderSection = (id) => {
    console.log('renderSection called with id:', id)
    switch (id) {
      case 'contact':
        return renderContact()
      case 'summary':
        return summary ? renderSummary() : null
      case 'skills':
        return skills.length ? renderSkills() : null
      case 'education':
        return education.length ? renderEducation() : null
      case 'projects':
        console.log('Rendering projects section, projects.length:', projects.length)
        return projects.length ? renderProjects() : null
      case 'workExperience':
        return normalizedWork.length ? renderWork(normalizedWork, 'Work Experience') : null
      case 'internship':
        // Only render internship section if there's data
        if (!normalizedInternships || normalizedInternships.length === 0) {
          console.log('No internship data, skipping section')
          return null
        }
        return renderWork(normalizedInternships, 'Internship Experience')
      case 'certificates':
      case 'certifications':
        // Only render certifications section if there's data
        const certs = certificates.length > 0 ? certificates : certifications
        return certs && certs.length > 0 ? renderCertifications() : null
      case 'languages':
        return languages && languages.length ? renderLanguages() : null
      case 'customSections':
        return customSections && customSections.length ? renderCustom() : null
      default:
        return null
    }
  }

  const renderContent = () => {
    // Filter out 'contact' from sections since it's rendered separately at the top
    const filteredSections = [...new Set([...sectionsOrder, 'customSections'])].filter(sec => sec !== 'contact')
    
    if (template?.layout?.type === 'two-column' && template.layout.columns) {
      const { left = [], right = [] } = template.layout.columns
      // Filter out 'contact' from column arrays and ensure customSections are included
      const leftFiltered = [...new Set([...left, 'customSections'])].filter(sec => sec !== 'contact')
      const rightFiltered = [...new Set([...right, 'customSections'])].filter(sec => sec !== 'contact')
      
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            {leftFiltered.map((sec) => (
              <div key={sec}>{renderSection(sec)}</div>
            ))}
          </div>
          <div>
            {rightFiltered.map((sec) => (
              <div key={sec}>{renderSection(sec)}
                {/* Always render custom sections at the bottom of the right column in two-column layout */}
                {sec === rightFiltered[rightFiltered.length - 1] && customSections.length > 0 && 
                  !rightFiltered.includes('customSections') && renderSection('customSections')}
              </div>
            ))}
          </div>
        </div>
      )
    }

    // For single column layout, just include customSections in the normal flow
    return filteredSections.map((section) => <div key={section}>{renderSection(section)}</div>)
  }

  const isEmpty =
    !summary &&
    skills.length === 0 &&
    education.length === 0 &&
    projects.length === 0 &&
    normalizedWork.length === 0 &&
    normalizedInternships.length === 0

  return (
    <div className="resume-preview" style={zoomLevel !== 1 ? { overflow: 'auto', maxHeight: '90vh' } : {}}>
      <div className="preview-controls">
        <div className="template-selector">
          <button 
            className="template-selector-button"
            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
          >
            🎨 Change Template
          </button>
          {showTemplateSelector && (
            <div className="template-dropdown">
              {TEMPLATES.map((t) => (
                <div 
                  key={t.id}
                  className={`template-option ${selectedTemplate === t.id ? 'active' : ''}`}
                  onClick={() => handleTemplateChange(t.id)}
                >
                  {t.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={zoomLevel !== 1 ? zoomStyle : {}}>
        <div
          className="resume-paper"
          id="resume-to-print"
          style={containerStyle}
        >
          {renderSection('contact')}
          {renderContent()}

          {isEmpty && (
            <div className="empty-preview">
              <p>Start filling in your details to see the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumePreview
