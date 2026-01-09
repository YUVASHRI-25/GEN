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

// Add auth token to requests
api.interceptors.request.use((config) => {
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
