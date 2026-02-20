import { useQuery } from '@tanstack/react-query';
import { fetchTemplates } from '../lib/api.js';
import { TemplateCard } from '../components/TemplateCard.js';

export function TemplatesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const templates = data?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Process Templates</h1>
        <p className="text-gray-500 mt-1">
          Select a template to customize for your client engagement.
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-gray-400">Loading templates...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">
          Failed to load templates: {(error as Error).message}
        </div>
      )}

      {!isLoading && templates.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-sm">No templates available.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template: any) => (
          <TemplateCard
            key={template.id}
            id={template.id}
            name={template.name}
            description={template.description}
            category={template.category}
          />
        ))}
      </div>
    </div>
  );
}
