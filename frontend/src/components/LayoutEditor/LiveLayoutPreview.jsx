import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import './LiveLayoutPreview.css'

/**
 * LiveLayoutPreview Component
 * Displays the resume preview with preserved original layout
 */
const LiveLayoutPreview = forwardRef(({
  layoutHtml,
  dimensions,
  scale = 1
}, ref) => {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const [currentScale, setCurrentScale] = useState(scale)

  // Expose methods to parent via ref (for backwards compatibility)
  useImperativeHandle(ref, () => ({
    updateContent: () => {
      // No-op - kept for API compatibility
    }
  }))

  // Calculate responsive scale
  useEffect(() => {
    const updateResponsiveScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 40
        const targetWidth = dimensions?.width || 612
        const responsiveScale = Math.min(1, containerWidth / targetWidth)
        setCurrentScale(scale * responsiveScale)
      }
    }

    updateResponsiveScale()
    window.addEventListener('resize', updateResponsiveScale)
    return () => window.removeEventListener('resize', updateResponsiveScale)
  }, [scale, dimensions])

  /**
   * Sanitize layout HTML to remove problematic elements like large black backgrounds
   */
  const sanitizeLayoutHtml = (html) => {
    if (!html) return ''
    
    // Parse the HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Find and remove large divs with dark backgrounds
    const allDivs = doc.querySelectorAll('div')
    allDivs.forEach(div => {
      const style = div.getAttribute('style') || ''
      const width = div.style.width ? parseInt(div.style.width) : 0
      const height = div.style.height ? parseInt(div.style.height) : 0
      
      // Check if it's a large element with black/dark background
      const hasBlackBg = style.includes('background') && 
        (style.includes('#000') || style.includes('rgb(0') || style.includes('black'))
      
      // Remove large dark rectangles (likely backgrounds)
      if (hasBlackBg && (width > 200 || height > 200)) {
        div.remove()
      }
      
      // Also check for very large elements covering most of page
      if (width > 400 && height > 400 && !div.classList.contains('pdf-page')) {
        const bg = style.match(/background:\s*([^;]+)/)
        if (bg && (bg[1].includes('#000') || bg[1].includes('rgb(0'))) {
          div.remove()
        }
      }
    })
    
    return doc.body.innerHTML
  }

  // Preview Mode - Shows original layout
  return (
    <div 
      ref={containerRef}
      className="live-layout-preview live-mode"
    >
      {/* Original Layout View */}
      {layoutHtml ? (
        <div 
          className="preview-wrapper"
          style={{
            width: (dimensions?.width || 612) * currentScale,
            height: 'auto',
            minHeight: (dimensions?.height || 792) * currentScale
          }}
        >
          <div 
            className="preview-scaler original-view"
            style={{
              transform: `scale(${currentScale})`,
              transformOrigin: 'top left',
              width: dimensions?.width || 612
            }}
          >
            <div 
              ref={contentRef}
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: sanitizeLayoutHtml(layoutHtml) }}
            />
          </div>
        </div>
      ) : (
        <div className="empty-preview">
          <div className="empty-icon">📄</div>
          <p>Upload a resume to see preview</p>
        </div>
      )}

      {/* Live indicator */}
      <div className="live-indicator">
        <span className="pulse"></span>
        <span className="text">Live Preview</span>
      </div>
    </div>
  )
})

LiveLayoutPreview.displayName = 'LiveLayoutPreview'

export default LiveLayoutPreview
