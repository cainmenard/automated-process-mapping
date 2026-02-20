import { useEffect, useRef } from 'react';
import { useBpmnStore } from '../stores/bpmn-store.js';
import { updateProcessMap } from '../lib/api.js';

/**
 * Autosave hook that debounces BPMN XML updates and persists to the API.
 * Uses a 3-second debounce as recommended in the architecture spec.
 */
export function useAutosave() {
  const { currentXml, isDirty, processMapId, setDirty } = useBpmnStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedXmlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isDirty || !processMapId || !currentXml) return;
    if (currentXml === lastSavedXmlRef.current) return;

    // Clear any pending save
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 3-second debounce
    timerRef.current = setTimeout(async () => {
      try {
        await updateProcessMap(processMapId, { bpmnXml: currentXml });
        lastSavedXmlRef.current = currentXml;
        setDirty(false);
      } catch (err) {
        console.error('Autosave failed:', err);
        // Don't clear dirty flag — retry on next change
      }
    }, 3000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentXml, isDirty, processMapId, setDirty]);
}
