"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const URL = require("url");
const httpProxy = require('http-proxy');
function asyncMiddleware(asyncHandler) {
    return (req, res, next) => {
        asyncHandler(req, res, next)
            .catch(next);
    };
}
function extractTargetAndPath(url) {
    const u = URL.parse(url);
    const target = u.protocol + '//' + u.host;
    const path = u.path + (u.hash ? u.hash : '');
    return [target, path];
}
class ProxyHandler {
    get handler() {
        if (!this._handler) {
            this._handler = this.execute.bind(this);
        }
        return this._handler;
    }
    constructor() {
        this.createProxy();
    }
    createProxy() {
        this._proxy = httpProxy.createProxyServer({});
        this._proxy.on('proxyReq', (proxyReq, req, res, options) => {
            const proxyInfo = req.proxyHandlerInfo;
            if (proxyInfo.rewriteRequest) {
                proxyInfo.rewriteRequest(proxyReq, req, res, options);
            }
        });
    }
    execute(req, res, next) {
        asyncMiddleware(this.middleware.bind(this))(req, res, next);
    }
    middleware(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const proxyInfo = yield this.getProxyInfo(req);
            if (proxyInfo) {
                const [target, path] = extractTargetAndPath(proxyInfo.url);
                proxyInfo.target = target;
                proxyInfo.path = path;
                req.proxyHandlerInfo = proxyInfo;
                req.origUrl = req.url;
                req.url = proxyInfo.url;
                this._proxy.web(req, res, next, { target: proxyInfo.target });
            }
            else {
                next();
            }
        });
    }
}
exports.ProxyHandler = ProxyHandler;

//# sourceMappingURL=proxy-handler.js.map
