import { useState, useCallback, useRef } from 'react';

/** The BPMN 2.0 XML namespace that every valid BPMN file must contain. */
const BPMN_NAMESPACE = 'http://www.omg.org/spec/BPMN/20100524/MODEL';

interface UseFileImportOptions {
  /** Called with the validated BPMN XML string after a successful import. */
  onImport: (xml: string) => void;
}

interface UseFileImportReturn {
  /** Opens the native file picker for .bpmn / .xml files. */
  importFile: () => void;
  /** Whether a file is currently being read / validated. */
  isImporting: boolean;
  /** The most recent import error message, or null. */
  error: string | null;
}

/**
 * Hook for importing BPMN XML files from the user's filesystem.
 *
 * Uses a hidden `<input type="file">` element to trigger the native file
 * picker. The selected file is read as text and validated for the presence
 * of the BPMN 2.0 namespace before being handed to the `onImport` callback.
 */
export function useFileImport({ onImport }: UseFileImportOptions): UseFileImportReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const importFile = useCallback(() => {
    setError(null);

    // Reuse or create the hidden file input
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.bpmn,.xml';
      input.style.display = 'none';
      document.body.appendChild(input);
      inputRef.current = input;
    }

    const input = inputRef.current;

    // Reset value so the same file can be re-selected
    input.value = '';

    const handleChange = () => {
      const file = input.files?.[0];
      if (!file) {
        cleanup();
        return;
      }

      setIsImporting(true);

      const reader = new FileReader();

      reader.onload = () => {
        try {
          const text = reader.result as string;

          if (!text || !text.includes(BPMN_NAMESPACE)) {
            setError(
              'The selected file does not appear to be a valid BPMN file. ' +
              'Expected the BPMN 2.0 namespace (http://www.omg.org/spec/BPMN/20100524/MODEL).'
            );
            return;
          }

          onImport(text);
        } catch (err: any) {
          setError(`Failed to process file: ${err.message}`);
        } finally {
          setIsImporting(false);
          cleanup();
        }
      };

      reader.onerror = () => {
        setError('Failed to read the selected file.');
        setIsImporting(false);
        cleanup();
      };

      reader.readAsText(file);
    };

    function cleanup() {
      input.removeEventListener('change', handleChange);
    }

    input.addEventListener('change', handleChange);
    input.click();
  }, [onImport]);

  return { importFile, isImporting, error };
}
