import { createContext, useContext, useState, useEffect } from 'react'

// Initial empty resume state
const initialResumeData = {
  contact: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    location: '',
    jobTitle: ''
  },
  skills: [],
  education: [],
  projects: [],
  internship: [],
  certificates: [],
  summary: '',
  languages: [],
  customSections: [],
  websites: []
}

const TEMPLATE_STORAGE_KEY = 'selectedTemplate'
const TEMPLATE_DATA_STORAGE_KEY = 'selectedTemplateData'

// Create Context
const ResumeContext = createContext()

// Auth Context for simple login state
const AuthContext = createContext()

// Resume Provider Component
export function ResumeProvider({ children }) {
  // Resume State
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('resumeData')
    return saved ? JSON.parse(saved) : initialResumeData
  })

  // Template State
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem(TEMPLATE_STORAGE_KEY) || null
  })
  const [selectedTemplateData, setSelectedTemplateData] = useState(() => {
    const saved = localStorage.getItem(TEMPLATE_DATA_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  })

  // Auth State (simple version)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token')
  })

  // Save resume data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData))
  }, [resumeData])

  // Save template selection
  useEffect(() => {
    if (selectedTemplate) {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, selectedTemplate)
    } else {
      localStorage.removeItem(TEMPLATE_STORAGE_KEY)
    }
  }, [selectedTemplate])

  useEffect(() => {
    if (selectedTemplateData) {
      localStorage.setItem(TEMPLATE_DATA_STORAGE_KEY, JSON.stringify(selectedTemplateData))
    } else {
      localStorage.removeItem(TEMPLATE_DATA_STORAGE_KEY)
    }
  }, [selectedTemplateData])

  // Update specific section of resume
  const updateResumeSection = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  // Update contact info
  const updateContact = (contactData) => {
    updateResumeSection('contact', { ...resumeData.contact, ...contactData })
  }

  // Add/Update skills
  const updateSkills = (skills) => {
    updateResumeSection('skills', skills)
  }

  // Add education entry
  const addEducation = (education) => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, education]
    }))
  }

  // Update education entry
  const updateEducation = (index, education) => {
    const updated = [...resumeData.education]
    updated[index] = education
    updateResumeSection('education', updated)
  }

  // Remove education entry
  const removeEducation = (index) => {
    const updated = resumeData.education.filter((_, i) => i !== index)
    updateResumeSection('education', updated)
  }

  // Add internship entry
  const addInternship = (internship) => {
    setResumeData(prev => ({
      ...prev,
      internship: [...prev.internship, internship]
    }))
  }

  // Update internship entry
  const updateInternship = (index, internship) => {
    const updated = [...resumeData.internship]
    updated[index] = internship
    updateResumeSection('internship', updated)
  }

  // Remove internship entry
  const removeInternship = (index) => {
    const updated = resumeData.internship.filter((_, i) => i !== index)
    updateResumeSection('internship', updated)
  }

  // Add certificate
  const addCertificate = (certificate) => {
    setResumeData(prev => ({
      ...prev,
      certificates: [...prev.certificates, certificate]
    }))
  }

  // Remove certificate
  const removeCertificate = (index) => {
    const updated = resumeData.certificates.filter((_, i) => i !== index)
    updateResumeSection('certificates', updated)
  }

  // Add project
  const addProject = (project) => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, project]
    }))
  }

  // Update project
  const updateProject = (index, project) => {
    const updated = [...resumeData.projects]
    updated[index] = project
    updateResumeSection('projects', updated)
  }

  // Remove project
  const removeProject = (index) => {
    const updated = resumeData.projects.filter((_, i) => i !== index)
    updateResumeSection('projects', updated)
  }

  // Update languages
  const updateLanguages = (languages) => {
    updateResumeSection('languages', languages)
  }

  // Add custom section
  const addCustomSection = (section) => {
    updateResumeSection('customSections', [...resumeData.customSections, section])
  }

  // Add website
  const addWebsite = (website) => {
    updateResumeSection('websites', [...resumeData.websites, website])
  }

  // Update website
  const updateWebsite = (index, updatedWebsite) => {
    const updatedWebsites = [...resumeData.websites]
    updatedWebsites[index] = updatedWebsite
    updateResumeSection('websites', updatedWebsites)
  }

  // Remove website
  const removeWebsite = (index) => {
    updateResumeSection('websites', resumeData.websites.filter((_, i) => i !== index))
  }

  // Remove custom section
  const removeCustomSection = (index) => {
    const updated = resumeData.customSections.filter((_, i) => i !== index)
    updateResumeSection('customSections', updated)
  }

  // Update summary
  const updateSummary = (summary) => {
    updateResumeSection('summary', summary)
  }

  // Reset resume data
  const resetResume = () => {
    setResumeData(initialResumeData)
    localStorage.removeItem('resumeData')
    setSelectedTemplate(null)
    setSelectedTemplateData(null)
  }

  // Auth functions
  const login = (userData, token) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const value = {
    // Resume data and functions
    resumeData,
    setResumeData,
    updateResumeSection,
    updateContact,
    updateSkills,
    addWebsite,
    updateWebsite,
    removeWebsite,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addInternship,
    updateInternship,
    removeInternship,
    addCertificate,
    removeCertificate,
    updateSummary,
    updateLanguages,
    addCustomSection,
    removeCustomSection,
    resetResume,

    // Template selection
    selectedTemplate,
    setSelectedTemplate,
    selectedTemplateData,
    setSelectedTemplateData,
    
    // Auth data and functions
    user,
    isAuthenticated,
    login,
    logout
  }

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  )
}

// Custom hook to use resume context
export function useResume() {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}

export default ResumeContext
