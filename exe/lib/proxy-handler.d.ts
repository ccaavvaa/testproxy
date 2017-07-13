/// <reference types="express" />
import { Request, RequestHandler } from 'express';
export interface IProxyInfo {
    url: string;
    target?: string;
    path?: string;
    rewriteRequest?: (reqProxy: any, req: any, res: any, options: any) => any;
}
export declare abstract class ProxyHandler {
    private _handler;
    private _proxy;
    readonly handler: RequestHandler;
    constructor();
    abstract getProxyInfo(req: Request): Promise<IProxyInfo>;
    private createProxy();
    private execute(req, res, next);
    private middleware(req, res, next);
}
