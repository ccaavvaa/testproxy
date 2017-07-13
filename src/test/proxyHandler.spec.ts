import * as e from 'express';
import * as p from '../lib/index';
import * as sample from './proxyHandler.sample';
import './debug-test';
import * as chai from 'chai';
import 'mocha';
import * as http from 'http';
import * as bodyParser from 'body-parser';

const expect = chai.expect;
describe('Server', () => {
    let app: e.Application;
    let handler = new sample.TextProxyHandler();
    before(() => {
        app = e();
        app.use(bodyParser.json({ type: ['application/json', 'application/json-patch+json'] }));
        app.use(bodyParser.urlencoded({ extended: false }));

        app.use(handler.handler);
        function onerror(err: any, req: e.Request, res: e.Response, next: e.NextFunction) {
            res
                .status(500)
                .send({
                    msg: err.message ? err.message : err,
                });
        }
        app.use(onerror);
        const server = http.createServer(app);
        const port = 9000;
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);

        function normalizePort(val: number | string): number | string | boolean {
            const portNum = (typeof val === 'string') ? parseInt(val, 10) : val;
            if (isNaN(portNum)) {
                return val;
            } else {
                if (portNum >= 0) {
                    return portNum;
                } else {
                    return false;
                }
            }
        }

        function onError(error: NodeJS.ErrnoException): void {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = (typeof port === 'string') ? `Pipe ${port}` : `Port ${port}`;
            switch (error.code) {
                case 'EACCES':
                    // tslint:disable-next-line:no-console
                    console.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    // tslint:disable-next-line:no-console
                    console.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        function onListening(): void {
            const addr = server.address();
            const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
            // tslint:disable-next-line:no-console
            console.log(`Listening on ${bind}`);
        }
    });
    it('t1', (done: any) => {
        http.get('http://localhost:9000/odata', (res) => {
            let str = '';
            res.on('data', (chunk) => { str += chunk; });
            res.on('end', () => {
                // tslint:disable-next-line:no-console
                expect(res.statusCode).eql(200);
                done();
            });
        });
    });
    it('t2', (done: any) => {
        http.get('http://localhost:9000/odata?error=1', (res) => {
            let str = '';
            res.on('data', (chunk) => { str += chunk; });
            res.on('end', () => {
                // tslint:disable-next-line:no-console
                expect(res.statusCode).eql(500);
                done();
            });
        });
    });
    it('t3', (done: any) => {
        http.get('http://localhost:9000/xx', (res) => {
            let str = '';
            res.on('data', (chunk) => { str += chunk; });
            res.on('end', () => {
                // tslint:disable-next-line:no-console
                expect(res.statusCode).eql(404);
                done();
            });
        });
    });
});
