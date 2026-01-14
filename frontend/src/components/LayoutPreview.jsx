import { useState, useEffect, useRef } from 'react'
import './LayoutPreview.css'

/**
 * LayoutPreview Component
 * Renders the layout-preserved HTML from PDF conversion
 * Shows exact visual representation of the original document
 */
function LayoutPreview({ 
  htmlContent, 
  dimensions, 
  scale = 1, 
  onSectionClick,
  editable = false 
}) {
  const containerRef = useRef(null)
  const [currentScale, setCurrentScale] = useState(scale)
  const [containerWidth, setContainerWidth] = useState(0)

  // Calculate responsive scale based on container width
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && dimensions?.width) {
        const containerWidth = containerRef.current.offsetWidth - 40 // padding
        const naturalWidth = dimensions.width
        const responsiveScale = Math.min(1, containerWidth / naturalWidth)
        setCurrentScale(scale * responsiveScale)
        setContainerWidth(containerWidth)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [scale, dimensions])

  // Handle click on text elements for editing
  const handleClick = (e) => {
    if (!editable || !onSectionClick) return

    const textElement = e.target.closest('.text-element')
    if (textElement) {
      const text = textElement.textContent
      const style = window.getComputedStyle(textElement)
      onSectionClick({
        text,
        fontSize: parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        color: style.color,
        x: parseFloat(textElement.style.left),
        y: parseFloat(textElement.style.top)
      })
    }
  }

  if (!htmlContent) {
    return (
      <div className="layout-preview-empty">
        <div className="empty-icon">📄</div>
        <p>No layout preview available</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`layout-preview-container ${editable ? 'editable' : ''}`}
      onClick={handleClick}
    >
      <div 
        className="layout-preview-scaler"
        style={{
          transform: `scale(${currentScale})`,
          transformOrigin: 'top center',
          width: dimensions?.width || 'auto'
        }}
      >
        <div 
          className="layout-preview-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  )
}

export default LayoutPreview
