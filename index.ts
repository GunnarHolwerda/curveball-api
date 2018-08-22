import * as Hapi from 'hapi';
import * as socketio from 'socket.io';
import * as fs from 'fs';
import { goodOptions } from './src/middleware/good-options';
import { IoServer } from './src/models/io-server';
import { registerRoutes } from './src/routes/register-routes';

require('dotenv').config();

let tls;
if (process.env.SSL_CERT && process.env.SSL_KEY) {
    console.log('SSL_CERT', process.env.SSL_CERT);
    console.log('SSL_kEY', process.env.SSL_KEY);
    tls = {
        key: fs.readFileSync(process.env.SSL_KEY!, 'utf8'),
        cert: fs.readFileSync(process.env.SSL_CERT!, 'utf8')
    };
    console.log('tls', tls);
}

const server = new Hapi.Server({
    port: 3001,
    tls,
    routes: {
        cors: {
            origin: 'ignore'
        }
    }
});
let ioServer: IoServer;

const validate = function (decoded: object): { isValid: boolean } {
    return { isValid: !!decoded };
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
        const io = socketio(server.listener, {
            transports: ['websocket']
        });
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