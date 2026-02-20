import { useRef, useEffect } from 'react';
import { useBpmnModeler } from '../hooks/useBpmnModeler.js';
import { useAutosave } from '../hooks/useAutosave.js';
import { useBpmnStore } from '../stores/bpmn-store.js';

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
  const { isReady, error, importXml, exportXml, zoomToFit, zoomIn, zoomOut } =
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

      {/* Canvas container — bpmn-js manages this DOM subtree */}
      <div ref={containerRef} className="flex-1 bg-white" />
    </div>
  );
}
