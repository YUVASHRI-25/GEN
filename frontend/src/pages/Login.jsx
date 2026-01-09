import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useResume } from '../context/ResumeContext'
import { authAPI } from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useResume()
  
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        // Register
        if (!formData.username || !formData.email || !formData.password) {
          setError('Please fill in all fields')
          setLoading(false)
          return
        }
        
        const response = await authAPI.register(formData)
        if (response.success) {
          // Auto-login after registration
          const loginResponse = await authAPI.login({
            email: formData.email,
            password: formData.password
          })
          login(loginResponse.user, loginResponse.token)
          navigate('/dashboard')
        }
      } else {
        // Login
        if (!formData.email || !formData.password) {
          setError('Please fill in all fields')
          setLoading(false)
          return
        }

        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        })

        if (response.success) {
          login(response.user, response.token)
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Handle Google Sign-In
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setGoogleLoading(true)
    
    try {
      const response = await authAPI.googleLogin(credentialResponse.credential)
      
      if (response.success) {
        login(response.user, response.token)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.')
  }

  // Demo login for easy testing
  const handleDemoLogin = () => {
    login(
      { id: 1, username: 'Demo User', email: 'demo@example.com' },
      'demo-token-12345'
    )
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
            <p>{isRegister ? 'Start building your resume' : 'Login to continue'}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading || googleLoading}
            >
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Login')}
            </button>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <div className="google-login-wrapper">
            {googleLoading ? (
              <div className="google-loading">Signing in with Google...</div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            )}
          </div>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button 
            onClick={handleDemoLogin}
            className="btn btn-secondary demo-btn"
          >
            🚀 Try Demo (No Login Required)
          </button>

          <p className="toggle-auth">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              onClick={() => setIsRegister(!isRegister)}
              className="toggle-btn"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
