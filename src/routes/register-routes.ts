import * as hapi from 'hapi';
import { IoServer } from '../models/io-server';
import { quizRoutes } from './quiz-routes';

export function registerRoutes(server: hapi.Server, ioServer: IoServer): void {
    server.route({
        path: '/',
        method: 'GET',
        handler: async () => {
            return {
                connecetdUsers: await ioServer.numConnected
            };
        }
    });

    server.route({
        path: '/health-check',
        method: 'GET',
        handler: () => 'ok',
        options: {
            auth: false
        }
    });

    quizRoutes(server, ioServer);
}