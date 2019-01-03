import * as Hapi from 'hapi';
import * as socketio from 'socket.io';
import * as fs from 'fs';
import * as redisAdapter from 'socket.io-redis';
import { ApplicationConfig } from './models/config';
import { IoServer } from './models/namespaces/io-server';
import Plugins from './plugins/plugin';
import { registerRoutes } from './routes/register-routes';
import { Database } from './models/database';

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
        cors: {
            origin: 'ignore'
        }
    }
});
let ioServer: IoServer;

async function start() {
    try {
        await Plugins.registerAll(server);
        const io = socketio(server.listener, { pingInterval: 5000, pingTimeout: 25000 });
        io.adapter(redisAdapter({ host: ApplicationConfig.redisHost, port: ApplicationConfig.redisPort }));
        ioServer = new IoServer(io);
        ioServer.start();
        registerRoutes(server, ioServer);
        await Database.instance.connect();
        await server.start();
        console.log('Server running at:', server.info.uri);
    } catch (err) {
        await Database.instance.disconnect();
        console.log(err);
        process.exit(1);
    }
}

start();

process.on('SIGINT', () => {
    process.exit();
});