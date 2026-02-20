import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchTemplate, instantiateTemplate } from '../lib/api.js';
import { TemplateForm } from '../components/TemplateForm.js';
import { useBpmnStore } from '../stores/bpmn-store.js';
import { useFormStore } from '../stores/form-store.js';

export function TemplateFormPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { setCurrentXml, setMode } = useBpmnStore();
  const { reset: resetForm } = useFormStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId,
  });

  const instantiateMutation = useMutation({
    mutationFn: (variables: Record<string, string>) =>
      instantiateTemplate(templateId!, variables),
    onSuccess: (result) => {
      setCurrentXml(result.data.bpmnXml);
      setMode('modeler');
      resetForm();
      // Navigate to editor with the generated XML
      navigate('/editor', { state: { bpmnXml: result.data.bpmnXml, templateId } });
    },
  });

  const template = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center py-12 text-gray-400">Loading template...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">
          Template not found or failed to load.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
        <p className="text-gray-500 mt-1">{template.description}</p>
      </div>

      {instantiateMutation.error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm mb-4">
          {(instantiateMutation.error as Error).message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TemplateForm
          schema={template.formSchema}
          onSubmit={(values) => instantiateMutation.mutate(values)}
          isSubmitting={instantiateMutation.isPending}
        />
      </div>
    </div>
  );
}
