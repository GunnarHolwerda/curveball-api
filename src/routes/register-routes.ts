import * as hapi from '@hapi/hapi';
import { IoServer } from '../models/namespaces/io-server';
import { quizRoutes } from './quiz-routes';
import { realtimeRoutes } from './realtime-routes';
import { ApplicationConfig } from '../models/config';
import { Environment } from '../types/environments';
import { testingRoutes } from './testing-routes';
import { userRoutes } from './user-routes';
import { questionRoutes } from './question-routes';
import { subjectRoutes } from './subject-routes';
import { accountRoutes } from './account-routes';

export function registerRoutes(server: hapi.Server, ioServer: IoServer): void {
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
    userRoutes(server, ioServer);
    questionRoutes(server, ioServer);
    subjectRoutes(server, ioServer);
    accountRoutes(server, ioServer);

    if (ApplicationConfig.nodeEnv === Environment.local) {
        testingRoutes(server, ioServer);
    }
}