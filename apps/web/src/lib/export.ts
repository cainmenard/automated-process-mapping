/**
 * Client-side export utilities for converting BPMN SVG diagrams
 * to downloadable PNG and SVG files using the browser-native
 * SVG-to-Canvas rendering pipeline.
 */

/**
 * Convert an SVG string to a PNG Blob using the browser canvas.
 *
 * Pipeline: SVG string -> Blob URL -> Image -> Canvas (scaled) -> PNG Blob
 *
 * @param svgString - Raw SVG markup from the BPMN modeler
 * @param scale - Render scale factor (default 3 for ~300 DPI on typical diagrams)
 * @returns PNG image as a Blob
 */
export async function exportToPng(svgString: string, scale: number = 3): Promise<Blob> {
  // Parse the SVG to extract its intrinsic dimensions
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = svgDoc.documentElement;

  // Attempt to read width/height from the root <svg> element.
  // bpmn-js typically sets these as attributes.
  let width = parseFloat(svgEl.getAttribute('width') ?? '0');
  let height = parseFloat(svgEl.getAttribute('height') ?? '0');

  // Fall back to the viewBox if explicit width/height are missing or zero
  if (!width || !height) {
    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number);
      width = parts[2] ?? 800;
      height = parts[3] ?? 600;
    } else {
      // Last resort defaults
      width = 800;
      height = 600;
    }
  }

  // Create a Blob URL for the SVG so the Image element can load it
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(url);

    // Create an oversized canvas for high-DPI output
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not obtain 2D canvas context');
    }

    // Fill with white background (SVGs are transparent by default)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale the context so the SVG draws at the higher resolution
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Wrap an SVG string in a downloadable Blob.
 */
export function exportToSvgFile(svgString: string): Blob {
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Trigger a browser download for the given Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  // Clean up after a short delay so the browser can initiate the download
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Load an image from a URL and resolve when it's fully decoded. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load SVG as image'));
    img.src = src;
  });
}

/** Promise wrapper around canvas.toBlob(). */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas toBlob() returned null'));
      }
    }, 'image/png');
  });
}
