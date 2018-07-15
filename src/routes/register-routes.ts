import * as hapi from 'hapi';
import { IoServer } from '../models/io-server';
import { quizRoutes } from './quiz-routes';

export function registerRoutes(server: hapi.Server, ioServer: IoServer): void {
    server.route({
        path: '/',
        method: 'GET',
        handler: async () => {
            return {
                connecetdUsers: ioServer.numConnected
            };
        }
    });

    quizRoutes(server, ioServer);
}