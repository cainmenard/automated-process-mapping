declare module 'bpmn-moddle' {
  interface ModdleElement {
    id?: string;
    $type: string;
    [key: string]: any;
  }

  interface SerializationResult {
    xml?: string;
  }

  interface ParseResult {
    rootElement: ModdleElement;
    warnings?: Array<{ message: string }>;
  }

  class BpmnModdle {
    constructor(options?: Record<string, unknown>);
    create(type: string, attrs?: Record<string, unknown>): ModdleElement;
    toXML(element: ModdleElement, options?: { format?: boolean }): Promise<SerializationResult>;
    fromXML(xml: string): Promise<ParseResult>;
  }

  export default BpmnModdle;
}

declare module 'bpmn-auto-layout' {
  export function layoutProcess(xml: string): Promise<string>;
  export default { layoutProcess: (xml: string) => Promise<string> };
}
