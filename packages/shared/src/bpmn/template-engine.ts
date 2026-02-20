import BpmnModdle from 'bpmn-moddle';
import { escapeXml, generateBpmnId } from '../utils/index.js';

/**
 * Instantiates a BPMN template by replacing placeholder variables
 * and applying structural modifications via bpmn-moddle.
 *
 * Two-phase approach:
 * Phase 1: Simple string replacement for {{placeholder}} variables
 * Phase 2: Structural modification via bpmn-moddle (ID regeneration, validation)
 */
export async function instantiateTemplate(
  templateXml: string,
  variables: Record<string, string>,
  options?: { regenerateIds?: boolean }
): Promise<string> {
  let xml = templateXml;

  // Phase 1: Variable substitution
  for (const [key, value] of Object.entries(variables)) {
    const escaped = escapeXml(value);
    xml = xml.replaceAll(`{{${key}}}`, escaped);
  }

  // Warn about unresolved placeholders
  const unresolved = xml.match(/\{\{[^}]+\}\}/g);
  if (unresolved) {
    console.warn('Unresolved template placeholders:', [...new Set(unresolved)]);
  }

  // Phase 2: Structural modification via bpmn-moddle
  const moddle = new BpmnModdle();
  const { rootElement: defs } = await moddle.fromXML(xml);

  if (options?.regenerateIds !== false) {
    regenerateElementIds(defs);
  }

  const { xml: outputXml } = await moddle.toXML(defs, { format: true });
  return outputXml!;
}

/**
 * Extracts placeholder variables from a BPMN XML template.
 * Returns unique placeholder keys found in the template.
 */
export function extractPlaceholders(templateXml: string): string[] {
  const matches = templateXml.match(/\{\{([^}]+)\}\}/g) ?? [];
  const keys = matches.map((m) => m.slice(2, -2));
  return [...new Set(keys)];
}

/**
 * Regenerates all element IDs in a BPMN definitions tree to prevent
 * conflicts when multiple instances of the same template are loaded.
 */
function regenerateElementIds(defs: any): void {
  const idMap = new Map<string, string>();

  function getNewId(oldId: string, prefix: string): string {
    if (!idMap.has(oldId)) {
      idMap.set(oldId, generateBpmnId(prefix));
    }
    return idMap.get(oldId)!;
  }

  // Update definitions ID
  if (defs.id) {
    defs.id = getNewId(defs.id, 'Definitions');
  }

  // Walk all root elements
  const rootElements = defs.rootElements ?? [];
  for (const el of rootElements) {
    regenerateIdsRecursive(el, idMap, getNewId);
  }
}

function regenerateIdsRecursive(
  element: any,
  idMap: Map<string, string>,
  getNewId: (oldId: string, prefix: string) => string
): void {
  if (!element || typeof element !== 'object') return;

  // Regenerate this element's ID
  if (element.id && typeof element.id === 'string') {
    const prefix = element.id.split('_')[0] || element.$type?.split(':')[1] || 'Element';
    element.id = getNewId(element.id, prefix);
  }

  // Recurse into known collection properties
  const collectionProps = [
    'flowElements',
    'participants',
    'lanes',
    'laneSets',
    'rootElements',
    'artifacts',
    'dataObjects',
  ];

  for (const prop of collectionProps) {
    if (Array.isArray(element[prop])) {
      for (const child of element[prop]) {
        regenerateIdsRecursive(child, idMap, getNewId);
      }
    }
  }
}
