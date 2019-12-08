import * as hapi from '@hapi/hapi';
import { IoServer } from '../models/namespaces/io-server';
import { putQuestionSchema, putQuestions } from './handlers/questions/put-question';
import { getQuestionTypes, getQuestionTypesQueryParams } from './handlers/questions/types/get-question-types';
import { getQuestionTopics } from './handlers/questions/topics/get-question-topics';
import { devRoutes } from './helpers/dev-routes';

export function questionRoutes(server: hapi.Server, _: IoServer): void {
    const routes: Array<hapi.ServerRoute> = [
        {
            path: '/questions/{questionId}',
            method: 'put',
            options: {
                auth: 'accountJwt',
                validate: { payload: putQuestionSchema },
                description: 'Update question information',
                notes: 'Updates question metadata'
            },
            handler: putQuestions
        },
        {
            path: '/questions/topics',
            method: 'get',
            options: {
                auth: 'accountJwt',
                description: 'Retrieve all available topics for questions',
                notes: 'Will return all available topics for associating with a question'
            },
            handler: getQuestionTopics
        },
        // {
        //     path: '/questions/calculator',
        //     method: 'post',
        //     options: {
        //         auth: 'accountJwt',
        //         validate: { payload: postQuestionCalculatorSchema },
        //         description: 'Creates new question calculator',
        //         notes:
        //      'Creates a new question calculator using the function provided, and is associated with the topic and type specified.'
        //     },
        //     handler: postQuestionCalculator
        // },
        // {
        //     path: '/questions/type',
        //     method: 'post',
        //     options: {
        //         auth: 'accountJwt',
        //         validate: { payload: postQuestionTypeSchema },
        //         description: 'Creates new question type',
        //         notes: 'Creates a new question type that can be used with questions'
        //     },
        //     handler: postQuestionType
        // },
        {
            path: '/questions/type',
            method: 'get',
            options: {
                auth: 'accountJwt',
                description: 'Retrieves all question types',
                notes: 'Returns all currently created question types',
                validate: { query: getQuestionTypesQueryParams }
            },
            handler: getQuestionTypes
        }
    ];

    devRoutes(routes).forEach(r => server.route(r));
}