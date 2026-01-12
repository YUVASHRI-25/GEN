const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Resume',
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  templateId: {
    type: String,
    default: 'ats-friendly'
  },
  contact: {
    full_name: { type: String, default: '' },
    desired_job_title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    profiles: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      leetcode: { type: String, default: '' },
      portfolio: { type: String, default: '' }
    }
  },
  summary: {
    type: String,
    default: ''
  },
  skills: [{
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    }
  }],
  education: [{
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: String, default: '' },
    gpa: { type: String, default: '' }
  }],
  projects: [{
    name: { type: String, default: '' },
    duration: { type: String, default: '' },
    technologies: [{ type: String }],
    description: { type: String, default: '' }
  }],
  experience: [{
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  certifications: [{
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' }
  }],
  languages: [{
    name: { type: String, default: '' },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Fluent', 'Native'],
      default: 'Intermediate'
    }
  }],
  custom_sections: [{
    title: { type: String, default: '' },
    content: { type: String, default: '' }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastModified on save
resumeSchema.pre('save', function (next) {
  this.lastModified = new Date();
  next();
});

// Index for faster queries
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ user: 1, title: 'text' });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
