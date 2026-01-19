// Template catalog with dummy data and styling for previews and builder
export const TEMPLATES = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Single-column, clean spacing, uppercase headings',
    layout: { type: 'single-column' },
    showProjects: true,
    theme: {
      fontFamily: "'Inter', Arial, sans-serif",
      nameSize: '32px',
      jobSize: '15px',
      bodySize: '11px',
      sectionSize: '14px',
      weightBold: 700,
      weightBody: 400,
      primary: '#111',
      secondary: '#444',
      accent: '#000',
      background: '#fff',
      divider: '#000',
      contactSeparator: ' | ',
      bullet: '•',
      sectionSpacing: '18px',
      itemSpacing: '10px',
      padding: '32px 40px',
    },
    sections: ['contact', 'summary', 'education', 'workExperience', 'projects', 'skills', 'certifications', 'languages'],
    dummyData: {
      contact: {
        name: 'SEBASTIAN BENNETT',
        jobTitle: 'Professional Accountant',
        email: 'hello@reallygreatsite.com',
        phone: '+123-456-7890',
        location: '123 Anywhere St., Any City',
      },
      summary:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
      education: [
        { degree: 'Senior Accountant', institution: 'Borcelle University', year: '2026-2030', gpa: '—' },
        { degree: 'Senior Accountant', institution: 'Borcelle University', year: '2023-2026', gpa: '—' },
      ],
      workExperience: [
        {
          position: 'Senior Accountant',
          company: 'Salford & Co.',
          duration: '2033-2035',
          description: 'Managed audits and financial reporting across multiple accounts.',
        },
        {
          position: 'Financial Accountant',
          company: 'Marble & Granite Inc.',
          duration: '2030-2033',
          description: 'Prepared financial statements and maintained general ledger.',
        },
      ],
      projects: [
        {
          name: 'Financial Analytics Dashboard',
          description: 'Developed a comprehensive financial dashboard for real-time expense tracking and budget analysis.',
          technologies: ['Excel', 'Power BI', 'SQL'],
          duration: '2023-2024',
          link: ''
        },
        {
          name: 'Tax Optimization System',
          description: 'Created a system to optimize tax calculations and identify potential savings for clients.',
          technologies: ['Python', 'Pandas', 'Flask'],
          duration: '2022-2023',
          link: ''
        }
      ],
      skills: ['Auditing', 'Financial Accounting', 'Financial Reporting', 'Budgeting', 'GAAP'],
      certifications: ['CPA', 'Chartered Accountant'],
      languages: [
        { language: 'English', proficiency: 'Native' },
        { language: 'Spanish', proficiency: 'Professional' },
        { language: 'French', proficiency: 'Basic' }
      ],
    },
  },
  {
    id: 'classic-profile',
    name: 'Classic Profile',
    description: 'Single-column with prominent profile and clean dividers',
    layout: { type: 'single-column' },
    theme: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      nameSize: '28px',
      jobSize: '14px',
      bodySize: '11px',
      sectionSize: '12px',
      weightBold: 700,
      weightBody: 400,
      primary: '#111',
      secondary: '#333',
      accent: '#111',
      background: '#fff',
      divider: '#000',
      contactSeparator: ' | ',
      bullet: '•',
      sectionSpacing: '16px',
      itemSpacing: '10px',
      padding: '28px 36px',
    },
    sections: ['contact', 'summary', 'workExperience', 'education', 'certifications', 'skills'],
    dummyData: {
      contact: {
        name: 'CONNOR HAMILTON',
        jobTitle: 'Real Estate Agent',
        email: 'hello@reallygreatsite.com',
        phone: '123-456-7890',
        location: 'reallygreatsite.com',
      },
      summary:
        'Experienced agent with 5+ years helping clients find and negotiate their dream homes. Strong market analysis and communication skills.',
      workExperience: [
        {
          position: 'Real Estate Agent',
          company: 'Really Great Company',
          duration: 'Jun 2015 - Present',
          bullets: [
            'Negotiate contracts and complex real estate transactions',
            'Provide excellent customer service and maintain client files',
            'Develop marketing campaigns and host open houses',
          ],
        },
      ],
      education: [{ degree: 'B.A. Business Administration', institution: 'University', year: '2010 - 2014' }],
      certifications: ['Licensed Real Estate Agent', 'Certified Real Estate Negotiator', 'Top Sales Agent 2016'],
      skills: [
        'Market research',
        'Communication',
        'Negotiation',
        'Problem-solving',
        'Time management',
      ],
      languages: [
        { language: 'English', proficiency: 'Native' },
        { language: 'Spanish', proficiency: 'Fluent' }
      ],
    },
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'Single column, generous spacing, serif headings',
    layout: { type: 'single-column' },
    theme: {
      fontFamily: "'Merriweather', 'Times New Roman', serif",
      nameSize: '29px',
      jobSize: '14px',
      bodySize: '11px',
      sectionSize: '13px',
      weightBold: 700,
      weightBody: 400,
      primary: '#1f2937',
      secondary: '#4b5563',
      accent: '#111827',
      background: '#ffffff',
      divider: '#1f2937',
      contactSeparator: ' · ',
      bullet: '•',
      sectionSpacing: '20px',
      itemSpacing: '12px',
      padding: '34px 42px',
    },
    sections: ['contact', 'summary', 'workExperience', 'projects', 'education', 'skills', 'languages'],
    dummyData: {
      contact: {
        name: 'PRIYA SHARMA',
        jobTitle: 'Data Analyst',
        email: 'priya.sharma@email.com',
        phone: '+91 98765 43210',
        location: 'Bangalore, IN',
      },
      summary:
        'Data analyst with experience turning business questions into dashboards and insights. Comfortable with SQL and Python.',
      workExperience: [
        {
          position: 'Data Analyst',
          company: 'InsightWorks',
          duration: '2020 - Present',
          description: 'Built reporting suite reducing manual ops by 30%.',
        },
      ],
      projects: [
        {
          name: 'Sales Forecasting Dashboard',
          duration: 'Q2 2023',
          description: 'Developed a time-series forecasting model that improved sales prediction accuracy by 8% using Python and pandas.',
          technologies: ['Python', 'pandas', 'Prophet', 'Tableau'],
          link: ''
        },
        {
          name: 'Customer Segmentation Analysis',
          duration: 'Q1 2023',
          description: 'Implemented K-means clustering to identify key customer segments, resulting in a 15% increase in marketing campaign effectiveness.',
          technologies: ['Python', 'scikit-learn', 'Matplotlib', 'Seaborn'],
          link: ''
        },
        {
          name: 'Data Pipeline Optimization',
          duration: 'Q4 2022',
          description: 'Optimized ETL processes, reducing data processing time by 40% and improving data quality.',
          technologies: ['SQL', 'Python', 'Apache Airflow', 'Docker'],
          link: ''
        }
      ],
      education: [{ degree: 'B.Tech Computer Science', institution: 'NIT', year: '2016 - 2020' }],
      skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'A/B Testing'],
      languages: [
        { language: 'English', proficiency: 'Professional' },
        { language: 'Hindi', proficiency: 'Native' },
        { language: 'Kannada', proficiency: 'Fluent' }
      ],
    },
  },
  {
    id: 'compact-ats',
    name: 'Compact ATS',
    description: 'ATS-friendly, tight spacing, clear headings',
    layout: { type: 'single-column' },
    showProjects: true,
    theme: {
      fontFamily: "'Arial', sans-serif",
      nameSize: '26px',
      jobSize: '13px',
      bodySize: '10px',
      sectionSize: '12px',
      weightBold: 700,
      weightBody: 400,
      primary: '#111',
      secondary: '#222',
      accent: '#000',
      background: '#fff',
      divider: '#000',
      contactSeparator: ' | ',
      bullet: '•',
      sectionSpacing: '14px',
      itemSpacing: '8px',
      padding: '26px 32px',
    },
    sections: ['contact', 'summary', 'skills', 'workExperience', 'projects', 'education'],
    dummyData: {
      contact: {
        name: 'JORDAN LEE',
        jobTitle: 'Software Engineer',
        email: 'jordan.lee@email.com',
        phone: '+1 444 222 9999',
        location: 'Austin, TX',
      },
      summary:
        'Engineer focused on backend services and APIs with strong attention to reliability and performance.',
      skills: ['JavaScript', 'TypeScript', 'Node.js', 'REST', 'SQL', 'Docker', 'AWS', 'Microservices'],
      workExperience: [
        {
          position: 'Senior Software Engineer',
          company: 'TechCorp',
          duration: '2021 - Present',
          description: 'Led development of core services handling 10K+ RPS.',
        },
        {
          position: 'Software Engineer',
          company: 'DevSolutions',
          duration: '2019 - 2021',
          description: 'Built and maintained microservices architecture.',
        },
      ],
      projects: [
        {
          name: 'Distributed Task Queue System',
          description: 'Designed and implemented a high-performance distributed task queue system using Node.js and Redis, reducing task processing time by 60%.',
          technologies: ['Node.js', 'Redis', 'Docker', 'Kubernetes'],
          duration: '2022-2023',
          link: 'https://github.com/example/task-queue'
        },
        {
          name: 'API Gateway Service',
          description: 'Developed a scalable API gateway handling authentication, rate limiting, and request routing for 50+ microservices.',
          technologies: ['Node.js', 'Express', 'JWT', 'Redis'],
          duration: '2021-2022',
          link: 'https://github.com/example/api-gateway'
        },
        {
          name: 'Real-time Analytics Dashboard',
          description: 'Created a real-time dashboard for monitoring system metrics and business KPIs with WebSocket integration.',
          technologies: ['React', 'WebSocket', 'D3.js', 'Node.js'],
          duration: '2020-2021',
          link: 'https://github.com/example/analytics-dashboard'
        }
      ],
      education: [
        { degree: 'B.S. Computer Science', institution: 'State University', year: '2015 - 2019', gpa: '3.7/4.0' },
      ],
    },
  },
]

export const DEFAULT_TEMPLATE_ID = TEMPLATES[0].id
