declare module '@clerk/fastify' {
  interface ClerkClient {
    verifyToken(token: string): Promise<{ sub: string; org_id?: string }>;
  }
  export function createClerkClient(options: { secretKey: string }): ClerkClient;
}

declare module 'bpmn-auto-layout' {
  export function layoutProcess(xml: string): Promise<string>;
}

declare module 'puppeteer' {
  interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }

  interface Page {
    setContent(html: string, options?: { waitUntil?: string }): Promise<void>;
    waitForSelector(selector: string, options?: { timeout?: number }): Promise<any>;
    pdf(options?: PdfOptions): Promise<Uint8Array>;
    $eval(selector: string, fn: (el: any) => string): Promise<string>;
  }

  interface PdfOptions {
    format?: string;
    landscape?: boolean;
    printBackground?: boolean;
    margin?: { top?: string; bottom?: string; left?: string; right?: string };
  }

  interface LaunchOptions {
    headless?: boolean | 'new';
    args?: string[];
  }

  export function launch(options?: LaunchOptions): Promise<Browser>;
}
