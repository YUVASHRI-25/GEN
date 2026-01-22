// Template 5: Modern Gray - Configuration
// This file LOCKS the design: fonts, colors, layout, spacing

export const template5Config = {
  id: 'modern-gray',
  name: 'Modern Gray',
  description: 'Professional two-column resume with modern typography and elegant gray tones',
  layout: {
    type: 'two-column',
    leftWidth: '35%',
    rightWidth: '65%'
  },
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif"
  },
  colors: {
    primary: '#2f2f2f',
    secondary: '#6b7280',
    accent: '#e5e7eb',
    background: '#ffffff',
    divider: '#d1d5db',
    headerBg: '#f9fafb'
  },
  spacing: {
    pagePadding: '40px',
    sectionGap: '24px',
    itemGap: '16px',
    columnGap: '32px'
  },
  typography: {
    nameSize: '42px',
    roleSize: '16px',
    sectionTitleSize: '14px',
    bodySize: '13px',
    contactSize: '14px'
  }
}
