import { v4 as uuidv4 } from 'uuid';

export function generateId(prefix?: string): string {
  const id = uuidv4().replace(/-/g, '').substring(0, 8);
  return prefix ? `${prefix}_${id}` : id;
}

export function generateBpmnId(prefix: string): string {
  return `${prefix}_${generateId()}`;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function stripXmlTags(xml: string): string {
  return xml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
