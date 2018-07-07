import * as Boom from 'boom';
import * as hapi from 'hapi';
import * as Joi from 'joi';

import { QuizNamespaceCache } from '../interfaces/quiz-namespace-cache';
import { IoServer } from '../models/io-server';
import { QuizNamespace } from '../models/quiz-namespace';

export function quizRoutes(server: hapi.Server, quizNamespaces: QuizNamespaceCache, ioServer: IoServer): void {
    server.route({
        path: '/quizzes',
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
            return {
                quizId: quizNamespace.quizId
            };
        }
    });

    server.route({
        path: '/quizzes/{quizId}',
        method: 'GET',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = quizNamespaces[quizId];
            if (!quizNamespaces.hasOwnProperty(quizId)) {
                return Boom.notFound();
            }
            return {
                quizId: quizNamespace.quizId
            };
        }
    });

    server.route({
        path: '/quizzes/{quizId}:connected',
        method: 'GET',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            return {
                connecetdUsers: quizNamespaces[quizId].numConnected
            };
        }
    });

    server.route({
        path: '/quizzes/{quizId}/question:emit',
        method: 'POST',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = quizNamespaces[quizId];
            if (!quizNamespaces.hasOwnProperty(quizId)) {
                return Boom.notFound();
            }
            quizNamespace.namespace.emit('question', req.payload);
            return req.payload;
        }
    });

    server.route({
        path: '/quizzes/{quizId}/results:emit',
        method: 'POST',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = quizNamespaces[quizId];
            quizNamespace.namespace.emit('results', req.payload);
            return req.payload;
        }
    });

    server.route({
        path: '/quizzes/{quizId}:destroy',
        method: 'POST',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            if (!quizNamespaces.hasOwnProperty(quizId)) {
                return Boom.notFound();
            }
            delete quizNamespaces[quizId];
            return {
                message: 'ok'
            };
        }
    });
}