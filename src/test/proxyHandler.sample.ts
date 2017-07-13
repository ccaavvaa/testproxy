import * as p from '../lib/index';
import * as e from 'express';
export class TextProxyHandler extends p.ProxyHandler {
    public async getProxyInfo(req: e.Request): Promise<p.IProxyInfo> {
        if (req.url.search('odata') >= 0) {
            if (req.query.error) {
                throw new Error('error');
            }
            return {
                url: 'http://sermilappaq/MDR/Mediateur/odata/RVTiers?tenantId=1',
                rewriteRequest: (proxyReq, r, res, options) => {
                    proxyReq.path += '&$top=1&$count=true';
                },
            };
        } else { return null; }
    }
}
