import * as hapi from '@hapi/hapi';

import { IoServer } from '../models/namespaces/io-server';
import { tagRoutes } from './helpers/tag-routes';
import { getSubjectsQuerySchema, getSubjects } from './handlers/subjects/get-subjects';

export function subjectRoutes(server: hapi.Server, _: IoServer): void {
    const routes: Array<hapi.ServerRoute> = [
        {
            path: '/subjects',
            method: 'get',
            options: {
                tags: ['api'],
                auth: 'accountJwt',
                validate: { query: getSubjectsQuerySchema },
                description: 'Retrieve subjects',
                notes: 'Retrieve subjects based on a question type and topic'
            },
            handler: getSubjects
        }
    ];

    tagRoutes(routes).forEach(r => server.route(r));
}