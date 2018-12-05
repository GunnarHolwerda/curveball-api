import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { quizRoutes } from './quiz-routes';
import { realtimeRoutes } from './realtime-routes';
import { ApplicationConfig } from '../models/config';
import { Environment } from '../types/environments';
import { testingRoutes } from './testing-routes';

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
    realtimeRoutes(server, ioServer);

    if (ApplicationConfig.nodeEnv === Environment.local) {
        testingRoutes(server, ioServer);
    }
}