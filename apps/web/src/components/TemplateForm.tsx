import { useFormStore } from '../stores/form-store.js';
import type { TemplateFormSchema } from '@bpmn-app/shared';

interface TemplateFormProps {
  schema: TemplateFormSchema;
  onSubmit: (values: Record<string, string>) => void;
  isSubmitting?: boolean;
}

export function TemplateForm({ schema, onSubmit, isSubmitting }: TemplateFormProps) {
  const { values, setValue } = useFormStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Merge default values for any unset fields
    const merged: Record<string, string> = {};
    for (const field of schema.fields) {
      merged[field.key] = values[field.key] ?? field.defaultValue ?? '';
    }
    for (const lane of schema.lanes) {
      if (!merged[lane.placeholder]) {
        merged[lane.placeholder] = values[lane.placeholder] ?? lane.defaultValue;
      }
    }

    onSubmit(merged);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lane configuration */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Swimlane Names
        </h3>
        <div className="space-y-3">
          {schema.lanes.map((lane) => (
            <div key={lane.placeholder}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {lane.label}
              </label>
              <input
                type="text"
                value={values[lane.placeholder] ?? lane.defaultValue}
                onChange={(e) => setValue(lane.placeholder, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Form fields */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Process Details
        </h3>
        <div className="space-y-3">
          {schema.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  value={values[field.key] ?? field.defaultValue ?? ''}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'multiline' ? (
                <textarea
                  value={values[field.key] ?? field.defaultValue ?? ''}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={values[field.key] ?? field.defaultValue ?? ''}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Generating...' : 'Generate Process Map'}
      </button>
    </form>
  );
}
