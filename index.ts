import * as Hapi from 'hapi';
import * as socketio from 'socket.io';

import { QuizNamespaceCache } from './src/interfaces/quiz-namespace-cache';
import { goodOptions } from './src/middleware/good-options';
import { IoServer } from './src/models/io-server';
import { registerRoutes } from './src/routes/register-routes';

const server = new Hapi.Server({
    port: 3001
});
let ioServer: IoServer;
const QuizNamespaces: QuizNamespaceCache = {};

async function start() {
    try {
        await server.register({
            plugin: require('good'),
            options: goodOptions,
        });
        const io = socketio(server.listener);
        ioServer = new IoServer(io);
        ioServer.start();
        registerRoutes(server, QuizNamespaces, ioServer);
        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();