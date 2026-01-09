import { useResume } from '../../context/ResumeContext'

function Contact() {
  const { resumeData, updateContact } = useResume()
  const { contact } = resumeData

  const handleChange = (e) => {
    updateContact({ [e.target.name]: e.target.value })
  }

  return (
    <div className="tab-section">
      <h2>👤 Contact Information</h2>
      <p>Let's start with your basic contact details</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={contact.name}
            onChange={handleChange}
            placeholder="e.g., Arun Kumar"
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobTitle">Desired Job Title</label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={contact.jobTitle}
            onChange={handleChange}
            placeholder="e.g., Software Developer, Web Developer"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={contact.email}
            onChange={handleChange}
            placeholder="e.g., arun@gmail.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={contact.phone}
            onChange={handleChange}
            placeholder="e.g., 9876543210"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={contact.location}
            onChange={handleChange}
            placeholder="e.g., Chennai, India"
          />
        </div>

        <div className="form-group">
          <label htmlFor="linkedin">LinkedIn Profile (optional)</label>
          <input
            type="url"
            id="linkedin"
            name="linkedin"
            value={contact.linkedin}
            onChange={handleChange}
            placeholder="e.g., linkedin.com/in/arunkumar"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="github">GitHub Profile (optional)</label>
        <input
          type="url"
          id="github"
          name="github"
          value={contact.github}
          onChange={handleChange}
          placeholder="e.g., github.com/arunkumar"
        />
      </div>

      <div className="form-group">
        <label htmlFor="leetcode">LeetCode Profile (optional)</label>
        <input
          type="url"
          id="leetcode"
          name="leetcode"
          value={contact.leetcode || ''}
          onChange={handleChange}
          placeholder="e.g., leetcode.com/username"
        />
      </div>

      <div className="tip-box">
        <strong>💡 Tip:</strong> Use a professional email address. 
        Avoid nicknames or numbers that don't look professional.
      </div>
    </div>
  )
}

export default Contact
