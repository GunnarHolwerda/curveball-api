import * as Hapi from 'hapi';
import * as socketio from 'socket.io';
import * as fs from 'fs';
import * as redisAdapter from 'socket.io-redis';
import { goodOptions } from './src/middleware/good-options';
import { IoServer } from './src/models/io-server';
import { registerRoutes } from './src/routes/register-routes';
import { ApplicationConfig } from './src/config';
import { Database } from './src/handlers/quiz/models/database';

require('dotenv').config();

let tls;
if (ApplicationConfig.sslCert && ApplicationConfig.sslCert) {
    tls = {
        key: fs.readFileSync(ApplicationConfig.sslKey!, 'utf8'),
        cert: fs.readFileSync(ApplicationConfig.sslCert!, 'utf8')
    };
}

// TODO: Add options path to all routes
// let cors: boolean | Hapi.RouteOptionsCors = false;
// if (ApplicationConfig.nodeEnv === Environment.local) {
//     cors = {
//         origin: ['*.dev.curveball.tv'],
//         additionalHeaders: ['qt']
//     };
// }

const server = new Hapi.Server({
    port: 3001,
    tls,
    routes: {
        cors: false
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
        server.auth.strategy('jwt', 'jwt', {
            key: ApplicationConfig.jwtSecret,
            validate: validate,
            verifyOptions: { algorithms: ['HS256'] },
        });
        server.auth.strategy('internalJwt', 'jwt',
            {
                key: ApplicationConfig.internalSecret,
                validate: validate,
                verifyOptions: { algorithms: ['HS256'] },
            });
        server.auth.default('jwt');
        const io = socketio(server.listener, { pingInterval: 5000, pingTimeout: 25000 });
        io.adapter(redisAdapter({ host: ApplicationConfig.redisHost, port: ApplicationConfig.redisPort }));
        ioServer = new IoServer(io);
        ioServer.start();
        registerRoutes(server, ioServer);
        await Database.instance.connect();
        await server.start();
    } catch (err) {
        await Database.instance.disconnect();
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();