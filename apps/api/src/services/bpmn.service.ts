import {
  generateBpmnXml,
  instantiateTemplate,
  validateBpmnXml,
  builtinTemplates,
  type BpmnGenerationInput,
} from '@bpmn-app/shared';

// Dynamic import for bpmn-auto-layout (ESM-only)
async function getAutoLayout() {
  const mod = await import('bpmn-auto-layout');
  return mod.default ?? mod;
}

/**
 * Generate BPMN XML from form input and auto-layout it.
 */
export async function generateAndLayoutBpmn(input: BpmnGenerationInput): Promise<string> {
  const xml = await generateBpmnXml(input);
  return autoLayoutBpmn(xml);
}

/**
 * Apply automatic layout to BPMN XML that lacks diagram interchange data.
 */
export async function autoLayoutBpmn(xml: string): Promise<string> {
  const { layoutProcess } = await getAutoLayout();
  return layoutProcess(xml);
}

/**
 * Instantiate a built-in template with client-provided variables,
 * then auto-layout the result.
 */
export async function instantiateAndLayoutTemplate(
  templateId: string,
  variables: Record<string, string>
): Promise<string> {
  const template = builtinTemplates.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const xml = await instantiateTemplate(template.bpmnXml, variables);

  // Try auto-layout; if it fails (e.g., diagram data already exists), return as-is
  try {
    return await autoLayoutBpmn(xml);
  } catch {
    return xml;
  }
}

/**
 * Validate BPMN XML and return structured result.
 */
export async function validateBpmn(xml: string) {
  return validateBpmnXml(xml);
}
