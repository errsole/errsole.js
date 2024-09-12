declare module 'errsole' {
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

  class Errsole {
    static port: number;

    static initialize(options: Options): void;
    static meta(data: any): LoggerContext;
    static alert: Logger;
    static error: Logger;
    static warn: Logger;
    static debug: Logger;
    static info: Logger;
    static log: Logger;

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

  export = Errsole;
}
export as namespace Errsole;
