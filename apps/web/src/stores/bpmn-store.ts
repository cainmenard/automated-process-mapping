import { create } from 'zustand';

interface BpmnState {
  /** Current BPMN XML in the editor */
  currentXml: string | null;
  /** Whether the editor has unsaved changes */
  isDirty: boolean;
  /** Current editor mode */
  mode: 'viewer' | 'modeler';
  /** Process map ID being edited (null for new/unsaved) */
  processMapId: string | null;

  setCurrentXml: (xml: string) => void;
  setDirty: (dirty: boolean) => void;
  setMode: (mode: 'viewer' | 'modeler') => void;
  setProcessMapId: (id: string | null) => void;
  reset: () => void;
}

export const useBpmnStore = create<BpmnState>((set) => ({
  currentXml: null,
  isDirty: false,
  mode: 'modeler',
  processMapId: null,

  setCurrentXml: (xml) => set({ currentXml: xml }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setMode: (mode) => set({ mode }),
  setProcessMapId: (id) => set({ processMapId: id }),
  reset: () =>
    set({
      currentXml: null,
      isDirty: false,
      mode: 'modeler',
      processMapId: null,
    }),
}));
