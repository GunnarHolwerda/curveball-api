import * as hapi from 'hapi';

import { QuizNamespaceCache } from '../interfaces/quiz-namespace-cache';
import { IoServer } from '../models/io-server';
import { quizRoutes } from './quiz-routes';

export function registerRoutes(server: hapi.Server, quizNamespaces: QuizNamespaceCache, ioServer: IoServer): void {
    server.route({
        path: '/',
        method: 'GET',
        handler: async () => {
            return {
                connecetdUsers: ioServer.numConnected
            };
        }
    });

    quizRoutes(server, quizNamespaces, ioServer);
}