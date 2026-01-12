import { useNavigate } from 'react-router-dom'
import './GetStarted.css'

function GetStarted() {
  const navigate = useNavigate()

  return (
      <div className="get-started-page">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Build Your <span className="gradient-text">ATS-Friendly</span> Resume
            </h1>
            <p className="hero-subtitle">
              Create a professional resume in minutes. Perfect for first-year engineering students.
              Our AI-powered builder helps you craft the perfect resume that gets past applicant tracking systems.
            </p>
            
            <div className="features">
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>ATS Optimized Templates</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>AI-Powered Summary Generator</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Simple & Easy to Use</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Download as PDF</span>
              </div>
            </div>

            {/* Choice Cards */}
            <div className="choice-cards">
              <div 
                className="choice-card"
                onClick={() => navigate('/login')}
              >
                <div className="choice-card-icon">✍️</div>
                <h3>Build from Scratch</h3>
                <p>Start fresh and create your resume step by step with our guided builder</p>
                <span className="choice-card-action">Get Started →</span>
              </div>
              
              <div 
                className="choice-card"
                onClick={() => navigate('/upload-resume')}
              >
                <div className="choice-card-icon">📄</div>
                <h3>Upload Resume</h3>
                <p>Already have a resume? Upload it and enhance it with AI-powered suggestions</p>
                <span className="choice-card-action">Upload Now →</span>
              </div>
            </div>
          </div>

          <div className="how-it-works">
            <h2>How It Works</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Sign Up</h3>
                <p>Create your free account in seconds</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Fill Your Details</h3>
                <p>Enter your information using simple forms</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>AI Enhancement</h3>
                <p>Our AI improves your summary and formatting</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Download Resume</h3>
                <p>Get your ATS-friendly resume instantly</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default GetStarted
