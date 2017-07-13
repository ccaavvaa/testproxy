import { Request, Response, RequestHandler, NextFunction } from 'express';
import * as URL from 'url';

const httpProxy = require('http-proxy');
export interface IProxyInfo {
    url: string;
    target?: string;
    path?: string;
    rewriteRequest?: (reqProxy: any, req: any, res: any, options: any) => any;
}

// tslint:disable-next-line:interface-name
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

function asyncMiddleware(asyncHandler: AsyncRequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        asyncHandler(req, res, next)
            .catch(next);
    };
}

function extractTargetAndPath(url: string): [string, string] {
    const u = URL.parse(url);
    const target = u.protocol + '//' + u.host;
    const path = u.path + (u.hash ? u.hash : '');
    return [target, path];
}

export abstract class ProxyHandler {
    private _handler: RequestHandler;
    private _proxy: any;
    public get handler(): RequestHandler {
        if (!this._handler) {
            this._handler = this.execute.bind(this);
        }
        return this._handler;
    }
    constructor() {
        this.createProxy();
    }

    public abstract getProxyInfo(req: Request): Promise<IProxyInfo>;
    private createProxy() {
        this._proxy = httpProxy.createProxyServer({});
        this._proxy.on('proxyReq', (proxyReq: any, req: any, res: any, options: any) => {
            const proxyInfo: IProxyInfo = req.proxyHandlerInfo;
            if (proxyInfo.rewriteRequest) {
                proxyInfo.rewriteRequest(proxyReq, req, res, options);
            }
        });
    }
    private execute(req: Request, res: Response, next: NextFunction): any {
        asyncMiddleware(this.middleware.bind(this))(req, res, next);
    }

    private async middleware(req: Request, res: Response, next: NextFunction): Promise<any> {
        const proxyInfo = await this.getProxyInfo(req);
        if (proxyInfo) {
            const [target, path] = extractTargetAndPath(proxyInfo.url);
            proxyInfo.target = target;
            proxyInfo.path = path;
            (req as any).proxyHandlerInfo = proxyInfo;
            (req as any).origUrl = req.url;
            req.url = proxyInfo.url;
            this._proxy.web(req, res, next, { target: proxyInfo.target });
        } else {
            next();
        }
    }
}
