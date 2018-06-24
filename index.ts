import * as Hapi from 'hapi';
import * as socketio from 'socket.io';

import { goodOptions } from './src/middleware/good-options';
import { IoServer } from './src/models/io-server';
import { SocketHandlers } from './src/models/socket-handlers';

const server = new Hapi.Server({
    port: 3001
});

server.route({
    path: '/',
    method: 'GET',
    handler: async () => {
        return {
            connecetdUsers: SocketHandlers.numConnected
        };
    }
});

async function start() {
    try {
        await server.register({
            plugin: require('good'),
            options: goodOptions,
        });
        const io = socketio(server.listener);
        IoServer.start(io);
        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();