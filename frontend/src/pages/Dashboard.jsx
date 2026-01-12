import { useNavigate } from 'react-router-dom'
import { useResume } from '../context/ResumeContext'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { user, resetResume } = useResume()

  const handleStartFromScratch = () => {
    resetResume() // Clear any existing data
    navigate('/templates')
  }

  const handleUploadResume = () => {
    navigate('/upload-resume')
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Welcome, {user?.username || 'User'}! 👋</h1>
          <p>Ready to create your professional resume?</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card primary" onClick={handleStartFromScratch}>
            <div className="card-icon">📝</div>
            <h2>Start from Scratch</h2>
            <p>Create a new resume by filling in your details step by step</p>
            <button className="btn btn-primary">Get Started</button>
          </div>

          <div className="dashboard-card primary" onClick={handleUploadResume}>
            <div className="card-icon">📤</div>
            <h2>Upload Resume</h2>
            <p>Upload an existing resume to enhance and optimize it with AI</p>
            <button className="btn btn-primary">Upload Now</button>
          </div>
        </div>

        <div className="info-section">
          <h3>✨ What you'll get:</h3>
          <ul>
            <li>🎯 ATS-optimized resume template</li>
            <li>🤖 AI-powered professional summary</li>
            <li>📊 Properly formatted skills section</li>
            <li>📄 Download as PDF</li>
          </ul>
        </div>

        <div className="tips-section">
          <h3>💡 Tips for First-Year Students:</h3>
          <div className="tips-grid">
            <div className="tip">
              <strong>Focus on Skills</strong>
              <p>Highlight programming languages and tools you've learned</p>
            </div>
            <div className="tip">
              <strong>Include Projects</strong>
              <p>Academic projects count! Add them to show practical experience</p>
            </div>
            <div className="tip">
              <strong>Certifications Matter</strong>
              <p>Online courses and certifications add value to your resume</p>
            </div>
            <div className="tip">
              <strong>Keep it Simple</strong>
              <p>One page is enough. Quality over quantity!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
