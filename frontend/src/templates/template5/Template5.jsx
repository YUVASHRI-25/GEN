// Template 5: Modern Gray - Two Column Professional Resume
// DESIGN IS LOCKED: Only data changes, not the layout/colors/fonts

import React from 'react'
import './styles.css'

// Section Component - Reusable for all sections
const Section = ({ title, children }) => (
  <div className="t5-section">
    <h3 className="t5-section-title">{title}</h3>
    {children}
  </div>
)

// Main Template Component
function Template5({ data }) {
  const {
    contact = {},
    summary = '',
    education = [],
    workExperience = [],
    skills = [],
    languages = [],
    projects = [],
    certifications = [],
    certificates = [],
    references = [],
    customSections = []
  } = data

  // Normalize skills to handle both string and object formats
  const normalizedSkills = skills.map(skill => 
    typeof skill === 'string' ? skill : skill.name || ''
  ).filter(Boolean)

  // Combine certifications and certificates
  const allCerts = [...(certifications || []), ...(certificates || [])]

  return (
    <div className="t5-paper">
      {/* HEADER */}
      <header className="t5-header">
        <h1>{contact.name || 'Your Name'}</h1>
        <p className="t5-role">{contact.jobTitle || 'Professional Title'}</p>
      </header>

      {/* CONTACT SECTION - VERTICAL LAYOUT WITH ICONS */}
      <div className="t5-contact">
        <div className="t5-contact-list">
          {contact.phone && (
            <div className="t5-contact-item">
              <svg className="t5-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.email && (
            <div className="t5-contact-item">
              <svg className="t5-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>{contact.email}</span>
            </div>
          )}
          {contact.location && (
            <div className="t5-contact-item">
              <svg className="t5-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
              </svg>
              <span>{contact.location}</span>
            </div>
          )}
          {contact.linkedin && (
            <div className="t5-contact-item">
              <svg className="t5-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
            </div>
          )}
        </div>
      </div>

      {/* TWO COLUMN BODY */}
      <div className="t5-body">
        {/* LEFT COLUMN */}
        <aside className="t5-left">
          {/* Education Section */}
          {education.length > 0 && (
            <Section title="Education">
              {education.map((edu, index) => (
                <div key={index} className="t5-edu-item">
                  <div className="t5-edu-year">{edu.year || edu.yearRange}</div>
                  <h4 className="t5-edu-degree">{edu.degree}</h4>
                  <p className="t5-edu-institution">{edu.institution || edu.college}</p>
                </div>
              ))}
            </Section>
          )}

          {/* Skills Section */}
          {normalizedSkills.length > 0 && (
            <Section title="Skills">
              <ul className="t5-skills-list">
                {normalizedSkills.map((skill, index) => (
                  <li key={index} className="t5-skill-item">{skill}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* Languages Section */}
          {languages.length > 0 && (
            <Section title="Languages">
              {languages.map((lang, index) => (
                <div key={index} className="t5-lang-item">
                  <span className="t5-lang-name">{lang.language || lang.name}</span>
                  <span className="t5-lang-level">{lang.proficiency}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Certifications Section */}
          {allCerts.length > 0 && (
            <Section title="Certifications">
              {allCerts.map((cert, index) => (
                <div key={index} className="t5-cert-item">
                  {typeof cert === 'string' ? cert : cert.name || cert.title}
                </div>
              ))}
            </Section>
          )}
        </aside>

        {/* RIGHT COLUMN */}
        <main className="t5-right">
          {/* Profile/Summary Section */}
          {summary && (
            <Section title="Profile">
              <p className="t5-profile">{summary}</p>
            </Section>
          )}

          {/* Work Experience Section */}
          {workExperience.length > 0 && (
            <Section title="Work Experience">
              {workExperience.map((exp, index) => (
                <div key={index} className="t5-work-item">
                  <div className="t5-work-header">
                    <h4 className="t5-work-position">{exp.position || exp.title}</h4>
                    <span className="t5-work-duration">{exp.duration}</span>
                  </div>
                  <p className="t5-work-company">{exp.company}</p>
                  {exp.description && (
                    <p className="t5-work-description">{exp.description}</p>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="t5-work-bullets">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Projects Section */}
          {projects && projects.length > 0 && (
            <Section title="Projects">
              {projects.map((project, index) => (
                <div key={index} className="t5-project-item">
                  <div className="t5-project-header">
                    <h4 className="t5-project-name">{project.name}</h4>
                    {project.duration && (
                      <span className="t5-project-duration">{project.duration}</span>
                    )}
                  </div>
                  {project.technologies && (
                    <p className="t5-project-tech">
                      {Array.isArray(project.technologies) 
                        ? project.technologies.join(' • ') 
                        : project.technologies}
                    </p>
                  )}
                  {project.description && (
                    <p className="t5-project-description">{project.description}</p>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* References Section */}
          {references && references.length > 0 && (
            <Section title="References">
              {references.map((ref, index) => (
                <div key={index} className="t5-ref-item">
                  <h4 className="t5-ref-name">{ref.name}</h4>
                  <p className="t5-ref-title">{ref.title}</p>
                  <p className="t5-ref-contact">
                    {ref.phone && <span>{ref.phone}</span>}
                    {ref.phone && ref.email && <span> | </span>}
                    {ref.email && <span>{ref.email}</span>}
                  </p>
                </div>
              ))}
            </Section>
          )}

          {/* Custom Sections */}
          {customSections && customSections.map((section, index) => (
            <Section key={index} title={section.title}>
              {section.items && section.items.map((item, idx) => (
                <div key={idx} className="t5-work-item">
                  {item.title && <h4 className="t5-work-position">{item.title}</h4>}
                  {item.subtitle && <p className="t5-work-company">{item.subtitle}</p>}
                  {item.description && <p className="t5-work-description">{item.description}</p>}
                </div>
              ))}
            </Section>
          ))}
        </main>
      </div>
    </div>
  )
}

export default Template5
