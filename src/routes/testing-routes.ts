import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { onlyLocalPreHandler } from './pres/only-local';
import * as Joi from 'joi';
import { generateRandomAnswers } from './handlers/testing/generate-random-answers';

export function testingRoutes(server: hapi.Server, _: IoServer): void {
    server.route({
        path: '/test/answers:generate',
        method: 'POST',
        options: {
            auth: false,
            tags: ['api', 'internal'],
            description: 'Creates a bunch of dummy answers for a quiz question',
            notes: 'Generates a bunch of dummy users to create answers for a question on a quiz',
            pre: [onlyLocalPreHandler],
            validate: {
                payload: {
                    questionId: Joi.string().description('The question to generate answer for'),
                    numAnswers: Joi.number().default(100).description('The number of answers to create')
                }
            }
        },
        handler: generateRandomAnswers
    });
}