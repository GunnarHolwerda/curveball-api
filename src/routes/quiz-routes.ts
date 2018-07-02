import * as Boom from 'boom';
import * as hapi from 'hapi';
import * as Joi from 'joi';

import { QuizNamespaceCache } from '../interfaces/quiz-namespace-cache';
import { IoServer } from '../models/io-server';
import { QuizNamespace } from '../models/quiz-namespace';

export function quizRoutes(server: hapi.Server, quizNamespaces: QuizNamespaceCache, ioServer: IoServer): void {
    server.route({
        path: '/create-quiz-room',
        method: 'POST',
        options: {
            validate: {
                payload: Joi.object().required().keys({
                    quizId: Joi.string().required().description('The quiz id to create the room for')
                })
            }
        },
        handler: async (req) => {
            const quizId: string = req.payload['quizId'];
            const ns = ioServer.server.of(`/${quizId}`);
            const quizNamespace = new QuizNamespace(quizId, ns);
            quizNamespaces[quizId] = quizNamespace;
            quizNamespace.start();
            return 'ok';
        }
    });

    server.route({
        path: '/{quizId}:connected',
        method: 'GET',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            return {
                connecetdUsers: quizNamespaces[quizId].numConnected
            };
        }
    });

    server.route({
        path: '/{quizId}/question:emit',
        method: 'POST',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = quizNamespaces[quizId];
            quizNamespace.namespace.emit('question', req.payload);
            return req.payload;
        }
    });

    server.route({
        path: '/{quizId}/results:emit',
        method: 'POST',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = quizNamespaces[quizId];
            quizNamespace.namespace.emit('results', req.payload);
            return req.payload;
        }
    });

    server.route({
        path: '/{quizId}:destroy',
        method: 'POST',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            if (!quizNamespaces.hasOwnProperty(quizId)) {
                return Boom.notFound();
            }
            delete quizNamespaces[quizId];
            return 'ok';
        }
    });
}