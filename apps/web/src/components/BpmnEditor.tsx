import { useRef, useEffect, useCallback, useState } from 'react';
import { useBpmnModeler } from '../hooks/useBpmnModeler.js';
import { useAutosave } from '../hooks/useAutosave.js';
import { useFileImport } from '../hooks/useFileImport.js';
import { useBpmnStore } from '../stores/bpmn-store.js';
import { exportToPng, exportToSvgFile, downloadBlob } from '../lib/export.js';

// Import bpmn-js styles
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

interface BpmnEditorProps {
  /** Initial BPMN XML to load */
  initialXml?: string;
  /** Called when the user explicitly saves */
  onSave?: (xml: string) => void;
  /** Whether to enable autosave (requires processMapId in store) */
  autosave?: boolean;
}

export function BpmnEditor({ initialXml, onSave, autosave = true }: BpmnEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isReady, error, importXml, exportXml, exportSvg, zoomToFit, zoomIn, zoomOut } =
    useBpmnModeler(containerRef);
  const { isDirty } = useBpmnStore();

  // Enable autosave when configured
  if (autosave) {
    useAutosave();
  }

  // Load initial XML when modeler is ready
  useEffect(() => {
    if (isReady && initialXml) {
      importXml(initialXml);
    }
  }, [isReady, initialXml, importXml]);

  const handleSave = async () => {
    const xml = await exportXml();
    if (xml && onSave) {
      onSave(xml);
    }
  };

  const handleDownloadXml = async () => {
    const xml = await exportXml();
    if (!xml) return;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `process-map-${Date.now()}.bpmn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      const svg = await exportSvg();
      if (!svg) return;
      const pngBlob = await exportToPng(svg);
      downloadBlob(pngBlob, `process-map-${Date.now()}.png`);
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = async () => {
    const svg = await exportSvg();
    if (!svg) return;
    const svgBlob = exportToSvgFile(svg);
    downloadBlob(svgBlob, `process-map-${Date.now()}.svg`);
  };

  const handleImportFile = useCallback(
    (xml: string) => {
      importXml(xml);
    },
    [importXml]
  );

  const { importFile, isImporting, error: importError } = useFileImport({
    onImport: handleImportFile,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={zoomIn}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={zoomToFit}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            title="Fit to viewport"
          >
            Fit
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-amber-600">Unsaved changes</span>
          )}
          <button
            onClick={importFile}
            disabled={isImporting}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </button>
          <button
            onClick={handleExportSvg}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Export SVG
          </button>
          <button
            onClick={handleDownloadXml}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Download BPMN
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-brand-600 text-white rounded hover:bg-brand-700"
            >
              Save Version
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>
      )}
      {importError && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-sm">{importError}</div>
      )}

      {/* Canvas container — bpmn-js manages this DOM subtree */}
      <div ref={containerRef} className="flex-1 bg-white" />
    </div>
  );
}
