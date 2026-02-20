import { useEffect, useRef, useCallback, useState } from 'react';
import { useBpmnStore } from '../stores/bpmn-store.js';

type BpmnModelerInstance = any;

/**
 * React hook for integrating bpmn-js Modeler.
 *
 * bpmn-js manages its own DOM subtree via SVG rendering and doesn't
 * participate in React's virtual DOM. This hook handles:
 * - Creating the Modeler instance on mount
 * - Importing XML when it changes
 * - Bridging bpmn-js events to React state (Zustand)
 * - Cleanup on unmount
 */
export function useBpmnModeler(containerRef: React.RefObject<HTMLDivElement | null>) {
  const modelerRef = useRef<BpmnModelerInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentXml, setDirty } = useBpmnStore();

  // Initialize the modeler
  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    // Dynamic import to code-split the ~1MB modeler bundle
    import('bpmn-js/lib/Modeler').then(({ default: BpmnModeler }) => {
      if (destroyed) return;

      const modeler = new BpmnModeler({
        container: containerRef.current!,
        keyboard: { bindTo: document },
      });

      // Bridge change events to React state
      modeler.on('commandStack.changed', async () => {
        setDirty(true);
        try {
          const { xml } = await modeler.saveXML({ format: true });
          if (xml) setCurrentXml(xml);
        } catch {
          // XML save can fail during intermediate states — ignore
        }
      });

      modelerRef.current = modeler;
      setIsReady(true);
    }).catch((err) => {
      setError(`Failed to load BPMN editor: ${err.message}`);
    });

    return () => {
      destroyed = true;
      modelerRef.current?.destroy();
      modelerRef.current = null;
      setIsReady(false);
    };
  }, [containerRef, setCurrentXml, setDirty]);

  // Import XML into the modeler
  const importXml = useCallback(
    async (xml: string) => {
      if (!modelerRef.current) return;
      setError(null);

      try {
        await modelerRef.current.importXML(xml);
        const canvas = modelerRef.current.get('canvas');
        canvas.zoom('fit-viewport');
        setCurrentXml(xml);
        setDirty(false);
      } catch (err: any) {
        setError(`Failed to import BPMN: ${err.message}`);
      }
    },
    [setCurrentXml, setDirty]
  );

  // Export current XML
  const exportXml = useCallback(async (): Promise<string | null> => {
    if (!modelerRef.current) return null;
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      return xml ?? null;
    } catch {
      return null;
    }
  }, []);

  // Export SVG
  const exportSvg = useCallback(async (): Promise<string | null> => {
    if (!modelerRef.current) return null;
    try {
      const { svg } = await modelerRef.current.saveSVG();
      return svg ?? null;
    } catch {
      return null;
    }
  }, []);

  // Zoom controls
  const zoomToFit = useCallback(() => {
    modelerRef.current?.get('canvas')?.zoom('fit-viewport');
  }, []);

  const zoomIn = useCallback(() => {
    const canvas = modelerRef.current?.get('canvas');
    if (canvas) canvas.zoom(canvas.zoom() * 1.2);
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = modelerRef.current?.get('canvas');
    if (canvas) canvas.zoom(canvas.zoom() / 1.2);
  }, []);

  return {
    modeler: modelerRef.current,
    isReady,
    error,
    importXml,
    exportXml,
    exportSvg,
    zoomToFit,
    zoomIn,
    zoomOut,
  };
}
