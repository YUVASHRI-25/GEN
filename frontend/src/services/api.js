import axios from 'axios'

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Create axios instance for file uploads
const uploadApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on unauthorized
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ AUTH API ============

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Google OAuth login
  googleLogin: async (credential) => {
    const response = await api.post('/auth/google', { credential })
    return response.data
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  }
}

// ============ RESUME API ============

export const resumeAPI = {
  // Generate complete resume
  generate: async (resumeData) => {
    const response = await api.post('/resume/generate', resumeData)
    return response.data
  },

  // Preview resume (without PDF)
  preview: async (resumeData) => {
    const response = await api.post('/resume/preview', resumeData)
    return response.data
  },

  // Enhance summary using LLM
  enhanceSummary: async (data) => {
    const response = await api.post('/resume/enhance-summary', data)
    return response.data
  },

  // Enhance project description using LLM
  enhanceProjectDescription: async (data) => {
    const response = await api.post('/resume/enhance-project-description', data)
    return response.data
  },

  // Enhance internship description using LLM
  enhanceInternshipDescription: async (data) => {
    const response = await api.post('/resume/enhance-internship-description', data)
    return response.data
  },

  // Enhance custom section content using LLM
  enhanceCustomContent: async (data) => {
    const response = await api.post('/resume/enhance-custom-content', data)
    return response.data
  },

  // Download resume
  download: async (id, format = 'pdf') => {
    const response = await api.get(`/resume/download/${id}?format=${format}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // ============ NEW UPLOAD & EDIT ENDPOINTS ============

  // Upload and parse resume file
  uploadResume: async (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    const response = await uploadApi.post('/resume/upload', formData)
    return response.data
  },

  // Enhance content with AI
  enhanceContent: async (data) => {
    const response = await api.post('/resume/enhance', data)
    return response.data
  },

  // Batch enhance multiple sections
  enhanceBatch: async (sections) => {
    const response = await api.post('/resume/enhance-batch', { sections })
    return response.data
  },

  // Get available templates
  getTemplates: async () => {
    const response = await api.get('/resume/templates')
    return response.data
  },

  // Download PDF with selected template
  downloadPDF: async (data) => {
    const response = await api.post('/resume/download-pdf', data, {
      responseType: 'blob'
    })
    return response.data
  },

  // Preview PDF configuration
  previewPDF: async (data) => {
    const response = await api.post('/resume/preview-pdf', data)
    return response.data
  },

  // ============ LAYOUT PRESERVATION ============

  // Convert PDF with layout preservation (exact positioning)
  convertWithLayout: async (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    const response = await uploadApi.post('/resume/convert-layout', formData)
    return response.data
  },

  // Preview layout HTML only
  previewLayout: async (file, scale = 1) => {
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('scale', scale)
    const response = await uploadApi.post('/resume/preview-layout', formData)
    return response.data
  },

  // Analyze layout structure
  analyzeLayout: async (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    const response = await uploadApi.post('/resume/analyze-layout', formData)
    return response.data
  }
}

// ============ HELPER FUNCTIONS ============

// Download blob as file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export default api
