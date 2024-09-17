// errsole.d.ts

// Errsole available as a global namespace
export as namespace Errsole;

// Errsole for module-based systems
export = Errsole;

// Errsole class and its static members
declare class Errsole {
  static port: number;

  static initialize(options: Errsole.Options): void;
  static meta(data: any): Errsole.LoggerContext;
  static alert: Errsole.Logger;
  static error: Errsole.Logger;
  static warn: Errsole.Logger;
  static debug: Errsole.Logger;
  static info: Errsole.Logger;
  static log: Errsole.Logger;

  static proxyMiddleware(): () => void;
  static multiFrameworkProxyMiddleware(): any;
  static expressProxyMiddleware(): any;
  static httpProxyMiddleware(): any;
  static connectProxyMiddleware(): any;
  static fastifyProxyMiddleware(): any;
  static koaProxyMiddleware(url: string): (ctx: any, next: any) => Promise<any>;
  static nestExpressProxyMiddleware(path: string, req: any, res: any, next: any): void;
  static nestFastifyProxyMiddleware(path: string, req: any, res: any): void;
  static hapiProxyMiddleware(basePath: string, auth?: boolean): {
    name: string;
    register: (server: any, options: any) => Promise<void>;
  };
}

// Errsole namespace containing interfaces and other types
declare namespace Errsole {
  interface Options {
    storage: any;
    port?: number;
    enableConsoleOutput?: boolean;
    exitOnException?: boolean;
    enableDashboard?: boolean;
    path?: string;
    appName?: string;
    environmentName?: string;
    serverName?: string;
    collectLogs?: string[];
  }

  interface Logger {
    (message?: any, ...optionalParams: any[]): void;
  }

  interface LoggerContext {
    metadata: any;
    alert: Logger;
    error: Logger;
    warn: Logger;
    debug: Logger;
    info: Logger;
    log: Logger;
  }

  interface ProxyMiddlewareOptions {
    target: string;
    changeOrigin: boolean;
    on?: {
      proxyReq?: (proxyReq: any) => void;
    };
  }

  interface KoaProxyOptions {
    target: string;
    changeOrigin: boolean;
    rewrite: (path: string) => string;
  }
}
