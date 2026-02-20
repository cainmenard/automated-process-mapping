import { create } from 'zustand';

interface FormState {
  /** Current template ID selected */
  templateId: string | null;
  /** Form field values keyed by field key */
  values: Record<string, string>;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;

  setTemplateId: (id: string | null) => void;
  setValue: (key: string, value: string) => void;
  setValues: (values: Record<string, string>) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

export const useFormStore = create<FormState>((set) => ({
  templateId: null,
  values: {},
  isSubmitting: false,

  setTemplateId: (id) => set({ templateId: id }),
  setValue: (key, value) =>
    set((state) => ({ values: { ...state.values, [key]: value } })),
  setValues: (values) => set({ values }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  reset: () => set({ templateId: null, values: {}, isSubmitting: false }),
}));
