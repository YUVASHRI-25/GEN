#!/usr/bin/env python3
"""
PDF to HTML Layout Converter

Converts PDF resumes to HTML while preserving exact visual layout:
- Text positioning (x, y coordinates)
- Font styles and sizes
- Multi-column layouts
- Images with positions
- Tables and alignment

Uses PyMuPDF (fitz) for accurate extraction.
"""

import sys
import io
import json
import base64
import fitz  # PyMuPDF
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Tuple
from collections import defaultdict

# Force UTF-8 encoding for stdout on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


@dataclass
class TextElement:
    """Text element with position and style"""
    text: str
    x: float
    y: float
    width: float
    height: float
    font_size: float
    font_name: str
    font_color: str
    is_bold: bool
    is_italic: bool


@dataclass
class ImageElement:
    """Image with position and data"""
    x: float
    y: float
    width: float
    height: float
    data_url: str  # base64 encoded


@dataclass
class LineElement:
    """Line/border element"""
    x1: float
    y1: float
    x2: float
    y2: float
    color: str
    width: float


class PDFToHTMLConverter:
    """Converts PDF to layout-preserving HTML"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)
        self.pages_html = []
        self.pages_data = []
        
    def hex_color(self, color) -> str:
        """Convert color to hex string"""
        if isinstance(color, (list, tuple)) and len(color) == 3:
            r, g, b = [int(c * 255) if c <= 1 else int(c) for c in color]
            return f"#{r:02x}{g:02x}{b:02x}"
        elif isinstance(color, int):
            r = (color >> 16) & 0xFF
            g = (color >> 8) & 0xFF
            b = color & 0xFF
            return f"#{r:02x}{g:02x}{b:02x}"
        return "#000000"
    
    def extract_text_elements(self, page) -> List[TextElement]:
        """Extract all text with exact positions and styles"""
        elements = []
        
        # Get text with detailed info
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
        
        for block in blocks:
            if block["type"] == 0:  # Text block
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text = span.get("text", "").strip()
                        if not text:
                            continue
                            
                        bbox = span.get("bbox", [0, 0, 0, 0])
                        font = span.get("font", "")
                        size = span.get("size", 12)
                        color = span.get("color", 0)
                        flags = span.get("flags", 0)
                        
                        # Detect bold/italic from flags or font name
                        is_bold = bool(flags & 2 ** 4) or "bold" in font.lower()
                        is_italic = bool(flags & 2 ** 1) or "italic" in font.lower()
                        
                        elements.append(TextElement(
                            text=text,
                            x=bbox[0],
                            y=bbox[1],
                            width=bbox[2] - bbox[0],
                            height=bbox[3] - bbox[1],
                            font_size=size,
                            font_name=font,
                            font_color=self.hex_color(color),
                            is_bold=is_bold,
                            is_italic=is_italic
                        ))
        
        return elements
    
    def extract_images(self, page) -> List[ImageElement]:
        """Extract images with positions as base64"""
        images = []
        
        for img_index, img in enumerate(page.get_images(full=True)):
            try:
                xref = img[0]
                base_image = self.doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Get image position
                img_rects = page.get_image_rects(xref)
                if img_rects:
                    rect = img_rects[0]
                    
                    # Convert to base64
                    b64_data = base64.b64encode(image_bytes).decode('utf-8')
                    data_url = f"data:image/{image_ext};base64,{b64_data}"
                    
                    images.append(ImageElement(
                        x=rect.x0,
                        y=rect.y0,
                        width=rect.width,
                        height=rect.height,
                        data_url=data_url
                    ))
            except Exception as e:
                print(f"Warning: Could not extract image: {e}", file=sys.stderr)
                
        return images
    
    def extract_lines(self, page) -> List[LineElement]:
        """Extract lines/borders - filter out large background rectangles"""
        lines = []
        page_width = page.rect.width
        page_height = page.rect.height
        
        drawings = page.get_drawings()
        for drawing in drawings:
            fill_color = drawing.get("fill", None)
            stroke_color = drawing.get("color", None)
            
            for item in drawing.get("items", []):
                if item[0] == "l":  # Actual line
                    # Line items have different structure
                    continue
                elif item[0] == "re":  # Rectangle
                    rect = item[1]
                    if rect:
                        rect_width = abs(rect.x1 - rect.x0)
                        rect_height = abs(rect.y1 - rect.y0)
                        
                        # Skip large rectangles (likely backgrounds)
                        # Skip if rectangle covers more than 50% of page
                        if rect_width > page_width * 0.5 and rect_height > page_height * 0.5:
                            continue
                        
                        # Skip very large rectangles even if not full page
                        if rect_width > 400 and rect_height > 400:
                            continue
                        
                        # Skip pure black large fills (likely sidebar backgrounds)
                        color = self.hex_color(fill_color or stroke_color or [0, 0, 0])
                        if color == "#000000" and (rect_width > 200 or rect_height > 200):
                            continue
                        
                        # Only include small decorative elements
                        if rect_width < 5 or rect_height < 5:  # Thin lines
                            lines.append(LineElement(
                                x1=rect.x0,
                                y1=rect.y0,
                                x2=rect.x1,
                                y2=rect.y1,
                                color=color,
                                width=drawing.get("width", 1)
                            ))
        
        return lines
    
    def detect_layout_type(self, text_elements: List[TextElement], page_width: float) -> dict:
        """Detect if layout is single or multi-column"""
        if not text_elements:
            return {"type": "single", "columns": 1}
        
        # Analyze x-coordinate distribution
        x_positions = [e.x for e in text_elements]
        
        # Check for two-column layout
        midpoint = page_width / 2
        left_count = sum(1 for x in x_positions if x < midpoint * 0.8)
        right_count = sum(1 for x in x_positions if x > midpoint * 0.6)
        
        # If significant content on both sides, it's two-column
        total = len(x_positions)
        if left_count > total * 0.2 and right_count > total * 0.2:
            # Detect column boundary
            sorted_x = sorted(set(x_positions))
            gaps = []
            for i in range(1, len(sorted_x)):
                gap = sorted_x[i] - sorted_x[i-1]
                if gap > 30:  # Significant gap
                    gaps.append((sorted_x[i-1] + gap/2, gap))
            
            if gaps:
                # Find the largest gap near center
                center_gaps = [(pos, gap) for pos, gap in gaps if midpoint * 0.4 < pos < midpoint * 1.6]
                if center_gaps:
                    boundary = max(center_gaps, key=lambda x: x[1])[0]
                    return {"type": "two-column", "columns": 2, "boundary": boundary}
        
        return {"type": "single", "columns": 1}
    
    def generate_html_for_page(self, page, page_num: int) -> Tuple[str, dict]:
        """Generate HTML for a single page with absolute positioning"""
        
        page_width = page.rect.width
        page_height = page.rect.height
        
        # Extract elements
        text_elements = self.extract_text_elements(page)
        images = self.extract_images(page)
        lines = self.extract_lines(page)
        
        # Detect layout
        layout_info = self.detect_layout_type(text_elements, page_width)
        
        # Build HTML
        html_parts = []
        
        # Page container with A4-like dimensions
        html_parts.append(f'''
<div class="pdf-page" data-page="{page_num}" style="
    position: relative;
    width: {page_width}px;
    height: {page_height}px;
    background: white;
    margin: 0 auto 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: visible;
">''')
        
        # Render lines/borders first (decorative elements only)
        for line in lines:
            line_width = abs(line.x2 - line.x1)
            line_height = abs(line.y2 - line.y1)
            
            # Render as a thin line/border, not a filled rectangle
            if line_width < 3:  # Vertical line
                html_parts.append(f'''
    <div class="pdf-line" style="
        position: absolute;
        left: {line.x1}px;
        top: {line.y1}px;
        width: 2px;
        height: {line_height}px;
        background: {line.color};
    "></div>''')
            elif line_height < 3:  # Horizontal line
                html_parts.append(f'''
    <div class="pdf-line" style="
        position: absolute;
        left: {line.x1}px;
        top: {line.y1}px;
        width: {line_width}px;
        height: 2px;
        background: {line.color};
    "></div>''')
        
        # Render images
        for img in images:
            html_parts.append(f'''
    <img src="{img.data_url}" style="
        position: absolute;
        left: {img.x}px;
        top: {img.y}px;
        width: {img.width}px;
        height: {img.height}px;
        object-fit: cover;
    " alt="Resume image" />''')
        
        # Group text elements by line (similar Y positions)
        # This helps prevent overlap from multiple spans on same line
        line_groups = {}
        y_tolerance = 3  # pixels
        
        for elem in text_elements:
            # Find existing line group or create new one
            found_group = None
            for group_y in line_groups:
                if abs(elem.y - group_y) <= y_tolerance:
                    found_group = group_y
                    break
            
            if found_group is not None:
                line_groups[found_group].append(elem)
            else:
                line_groups[elem.y] = [elem]
        
        # Render text elements, sorted by Y then X
        for line_y in sorted(line_groups.keys()):
            line_elements = sorted(line_groups[line_y], key=lambda e: e.x)
            
            for elem in line_elements:
                font_weight = "bold" if elem.is_bold else "normal"
                font_style = "italic" if elem.is_italic else "normal"
                
                # Escape HTML
                escaped_text = (elem.text
                    .replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace('"', "&quot;"))
                
                # Use the element's actual height for positioning
                # The Y coordinate from PDF is often the baseline, adjust upward
                adjusted_y = elem.y
                
                html_parts.append(f'''
    <span class="text-element" data-line-y="{line_y:.1f}" style="
        position: absolute;
        left: {elem.x:.1f}px;
        top: {adjusted_y:.1f}px;
        width: {max(elem.width, 10):.1f}px;
        height: {elem.height:.1f}px;
        font-size: {elem.font_size:.1f}px;
        font-weight: {font_weight};
        font-style: {font_style};
        color: {elem.font_color};
        white-space: nowrap;
        line-height: 1;
        display: flex;
        align-items: center;
        overflow: visible;
    ">{escaped_text}</span>''')
        
        html_parts.append('\n</div>')
        
        # Page data for structured extraction
        page_data = {
            "page": page_num,
            "width": page_width,
            "height": page_height,
            "layout": layout_info,
            "elements": {
                "text": [asdict(e) for e in text_elements],
                "images": [asdict(e) for e in images],
                "lines": [asdict(e) for e in lines]
            }
        }
        
        return "\n".join(html_parts), page_data
    
    def convert(self) -> dict:
        """Convert entire PDF to HTML"""
        
        all_html = []
        all_data = []
        
        # Add wrapper and styles
        all_html.append('''
<div class="pdf-preview-container">
<style>
.pdf-preview-container {
    font-family: Arial, sans-serif;
    background: transparent;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}
.pdf-page {
    transform-origin: top center;
    position: relative;
    box-sizing: border-box;
    display: block;
    flex-shrink: 0;
}
.text-element {
    cursor: text;
    user-select: text;
    box-sizing: border-box;
    pointer-events: auto;
}
.text-element:hover {
    background: rgba(66, 133, 244, 0.1);
}
@media print {
    .pdf-preview-container { background: white; padding: 0; }
    .pdf-page { box-shadow: none; margin: 0; }
}
</style>''')
        
        # Process each page
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            html, data = self.generate_html_for_page(page, page_num + 1)
            all_html.append(html)
            all_data.append(data)
        
        all_html.append('\n</div>')
        
        # Determine overall layout
        overall_layout = "single"
        for data in all_data:
            if data["layout"]["type"] == "two-column":
                overall_layout = "two-column"
                break
        
        return {
            "success": True,
            "html": "\n".join(all_html),
            "pages": all_data,
            "pageCount": len(self.doc),
            "layout": overall_layout,
            "dimensions": {
                "width": all_data[0]["width"] if all_data else 612,
                "height": all_data[0]["height"] if all_data else 792
            }
        }
    
    def close(self):
        """Close the PDF document"""
        self.doc.close()


def main():
    """CLI entry point"""
    import traceback
    
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: pdf_to_html.py <pdf_path>"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not Path(pdf_path).exists():
        print(json.dumps({"success": False, "error": f"File not found: {pdf_path}"}))
        sys.exit(1)
    
    try:
        converter = PDFToHTMLConverter(pdf_path)
        result = converter.convert()
        converter.close()
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(json.dumps({
            "success": False,
            "error": str(e),
            "traceback": error_trace
        }), file=sys.stderr)
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
