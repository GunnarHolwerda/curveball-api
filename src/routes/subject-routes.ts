import * as hapi from 'hapi';

import { IoServer } from '../models/namespaces/io-server';
import { devRoutes } from './helpers/dev-routes';

export function userRoutes(server: hapi.Server, _: IoServer): void {
    const routes: Array<hapi.ServerRoute> = [
        {
            path: '/subjects',
            method: 'get',
            options: {
                validate: { query: undefined },
                description: 'Retrieve subjects',
                notes: 'Retrieve subjects based on a question type and topic'
            },
            handler: undefined
        }
    ];

    devRoutes(routes).forEach(r => server.route(r));
}