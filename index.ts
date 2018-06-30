import * as Hapi from 'hapi';
import * as socketio from 'socket.io';

import { goodOptions } from './src/middleware/good-options';
import { IoServer } from './src/models/io-server';
import { QuizNamespace } from './src/models/quiz-namespace';

const server = new Hapi.Server({
    port: 3001
});
let ioServer: IoServer;
const QuizNamespaces: { [quizId: string]: QuizNamespace } = {};

server.route({
    path: '/',
    method: 'GET',
    handler: async () => {
        return {
            connecetdUsers: ioServer.numConnected
        };
    }
});

server.route({
    path: '/create-quiz-room',
    method: 'POST',
    handler: async (req) => {
        const quizId: string = req.payload['quizId'];
        const ns = ioServer.server.of(`/${quizId}`);
        const quizNamespace = new QuizNamespace(quizId, ns);
        QuizNamespaces[quizId] = quizNamespace;
        quizNamespace.start();
    }
});

async function start() {
    try {
        await server.register({
            plugin: require('good'),
            options: goodOptions,
        });
        const io = socketio(server.listener);
        ioServer = new IoServer(io);
        ioServer.start();
        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();