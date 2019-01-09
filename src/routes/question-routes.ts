import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { putQuestionSchema, putQuestions } from './handlers/questions/put-question';
import { postQuestionTypeSchema, postQuestionType } from './handlers/questions/types/post-question-type';
import { getQuestionTypes } from './handlers/questions/types/get-question-types';

export function questionRoutes(server: hapi.Server, _: IoServer): void {
    const routes: Array<hapi.ServerRoute> = [
        {
            path: '/questions/{questionId}',
            method: 'put',
            options: {
                auth: 'internalJwt',
                validate: { payload: putQuestionSchema },
                description: 'Update question information',
                notes: 'Updates question metadata'
            },
            handler: putQuestions
        },
        {
            path: '/questions/type',
            method: 'post',
            options: {
                auth: 'internalJwt',
                validate: { payload: postQuestionTypeSchema },
                description: 'Creates new question type',
                notes: 'Creates a new question type that can be used with questions'
            },
            handler: postQuestionType
        },
        {
            path: '/questions/type',
            method: 'get',
            options: {
                auth: 'internalJwt',
                description: 'Retrieves all question types',
                notes: 'Returns all currently created question types'
            },
            handler: getQuestionTypes
        }
    ];

    const devRoutes = routes.map(r => {
        r.path = '/dev' + r.path;
        if (!r.options) {
            r.options = {};
        }

        const options: hapi.RouteOptions = r.options as hapi.RouteOptions;

        if (options.tags) {
            options.tags = [...options.tags!, 'api'];
        } else {
            options.tags = ['api'];
        }
        if (options.auth === 'internalJwt') {
            options.tags.push('internal');
        }
        r.options = options;
        return r;
    });

    devRoutes.forEach(r => server.route(r));
}