import { useMemo } from 'react'
import { useResume } from '../context/ResumeContext'
import './ResumePreview.css'

function ResumePreview({ zoomLevel = 1, template, dataOverride }) {
  const { resumeData } = useResume()
  const data = dataOverride || resumeData
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

  const renderContact = () => {
    const separator = theme.contactSeparator || ' | '
    const contactBits = [
      contact.email,
      contact.phone,
      contact.location || contact.linkedin || contact.github
    ].filter(Boolean)

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
              marginBottom: '8px',
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
            gap: '8px',
            justifyContent: 'center'
          }}
        >
          {contactBits.map((item, idx) => (
            <span key={idx}>
              {item}
              {idx < contactBits.length - 1 ? separator : ''}
            </span>
          ))}
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
        {skills.map((skill, index) => (
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
            {template?.theme?.bullet || '•'} {skill.name || skill}
          </li>
        ))}
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
        return normalizedInternships.length ? renderWork(normalizedInternships, 'Internship Experience') : null
      case 'certificates':
      case 'certifications':
        return renderCertifications()
      case 'languages':
        return languages.length ? renderLanguages() : null
      case 'customSections':
        return customSections.length ? renderCustom() : null
      default:
        return null
    }
  }

  const renderContent = () => {
    // Filter out 'contact' from sections since it's rendered separately at the top
    const filteredSections = sectionsOrder.filter(sec => sec !== 'contact')
    
    if (template?.layout?.type === 'two-column' && template.layout.columns) {
      const { left = [], right = [] } = template.layout.columns
      // Filter out 'contact' from column arrays as well
      const leftFiltered = left.filter(sec => sec !== 'contact')
      const rightFiltered = right.filter(sec => sec !== 'contact')
      
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            {leftFiltered.map((sec) => (
              <div key={sec}>{renderSection(sec)}</div>
            ))}
          </div>
          <div>
            {rightFiltered.map((sec) => (
              <div key={sec}>{renderSection(sec)}</div>
            ))}
          </div>
        </div>
      )
    }

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
