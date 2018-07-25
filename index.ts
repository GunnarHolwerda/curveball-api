import * as Hapi from 'hapi';
import * as socketio from 'socket.io';
// import * as fs from 'fs';

import { goodOptions } from './src/middleware/good-options';
import { IoServer } from './src/models/io-server';
import { registerRoutes } from './src/routes/register-routes';

require('dotenv').config();

// const tls = {
//     key: fs.readFileSync(process.env.SSL_CERT_KEY!),
//     cert: fs.readFileSync(process.env.SSL_CERT_PATH!)
// };

const server = new Hapi.Server({
    port: 3001,
    // tls,
    routes: {
        cors: {
            origin: ['*'],
            headers: ['Accept', 'Content-Type'],
            additionalHeaders: ['X-Requested-With']
        }
    }
});
let ioServer: IoServer;

async function start() {
    try {
        await server.register({
            plugin: require('good'),
            options: goodOptions,
        });
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