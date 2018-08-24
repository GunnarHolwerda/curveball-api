import * as Hapi from 'hapi';
import * as socketio from 'socket.io';
import * as fs from 'fs';
import * as redisAdapter from 'socket.io-redis';
import { goodOptions } from './src/middleware/good-options';
import { IoServer } from './src/models/io-server';
import { registerRoutes } from './src/routes/register-routes';
import { ApplicationConfig } from './src/config';

require('dotenv').config();

let tls;
if (ApplicationConfig.sslCert && ApplicationConfig.sslCert) {
    tls = {
        key: fs.readFileSync(ApplicationConfig.sslKey!, 'utf8'),
        cert: fs.readFileSync(ApplicationConfig.sslCert!, 'utf8')
    };
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
                key: ApplicationConfig.internalSecret,
                validate: validate,
                verifyOptions: { algorithms: ['HS256'] }
            });
        server.auth.default('jwt');
        const io = socketio(server.listener, { transports: ['websocket'], allowUpgrades: false, pingTimeout: 15000, pingInterval: 60000 });
        io.adapter(redisAdapter({ host: ApplicationConfig.redisHost, port: ApplicationConfig.redisPort }));
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