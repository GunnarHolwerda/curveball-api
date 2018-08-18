import * as Hapi from 'hapi';
import * as socketio from 'socket.io';
import * as https from 'https';

import { goodOptions } from './src/middleware/good-options';
import { IoServer } from './src/models/io-server';
import { registerRoutes } from './src/routes/register-routes';

require('dotenv').config();

function createServer(): Hapi.Server {
    const useSsl = !!process.env.SSL_ISSUE_URL || undefined;
    let httpsServer: https.Server | undefined;
    let acmeResponder: any;
    if (useSsl) {
        const greenlock = require('greenlock-hapi').create({
            version: 'draft-11', // Let's Encrypt v2 You MUST change this to 'https://acme-v02.api.letsencrypt.org/directory' in production
            server: process.env.SSL_ISSUE_URL,
            agreeTos: true,
            email: 'gunnarholwerda@gmail.com',
            approveDomains: process.env.SSL_APPROVED_DOMAINS!.split(','),
            configDir: require('os').homedir() + '/realtime/etc',
            debug: true
        });
        acmeResponder = greenlock.middleware();
        httpsServer = https.createServer(greenlock.httpsOptions).listen(443);
    }

    const hapiServer = new Hapi.Server({
        port: useSsl ? undefined : 3001,
        listener: httpsServer ? undefined : httpsServer as any,
        tls: useSsl,
        autoListen: !useSsl,
        // routes: {
        //     cors: { origin: (process.env.ALLOWED_ORIGINS || '').split(',') }
        // }
        routes: { cors: { origin: 'ignore' } }
    });

    if (useSsl) {
        hapiServer.route({
            method: 'GET',
            path: '/.well-known/acme-challenge',
            handler: (request) => {
                const req = request.raw.req;
                const res = request.raw.res;

                acmeResponder(req, res);
            }
        });
    }
    return hapiServer;
}
const server = createServer();
let ioServer: IoServer;

const validate = function (decoded: object): { isValid: boolean } {
    if (decoded) {
        return { isValid: true };
    } else {
        return { isValid: false };
    }
};

async function start() {
    try {
        await server.register({
            plugin: require('good'),
            options: goodOptions,
        });
        await server.register(require('hapi-auth-jwt2'));
        server.auth.strategy('jwt', 'jwt',
            {
                key: process.env.INTERNAL_SECRET!,
                validate: validate,
                verifyOptions: { algorithms: ['HS256'] }
            });
        server.auth.default('jwt');
        const io = socketio(server.listener);
        ioServer = new IoServer(io);
        ioServer.start();
        registerRoutes(server, ioServer);
        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();