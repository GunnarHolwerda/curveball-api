import * as Boom from 'boom';
import * as hapi from 'hapi';
import * as Joi from 'joi';

import { IoServer } from '../models/namespaces/io-server';
import { QuizNamespace } from '../models/namespaces/quiz-namespace';
import { QuizCache } from '../models/quiz-cache';
import { ServerEvents } from '../types/events';
import { IQuizResponse } from '../models/entities/quiz';

async function getNamespace(quizId: string, ioServer: IoServer): Promise<QuizNamespace | null> {
    const quiz = await QuizCache.getQuiz(quizId);
    if (!quiz) {
        return null;
    }
    const namespace = ioServer.getNamespace(quizId);
    return new QuizNamespace(namespace, quiz!);
}

export function realtimeRoutes(server: hapi.Server, ioServer: IoServer): void {
    server.route({
        path: '/realtime/quizzes',
        method: 'POST',
        options: {
            auth: 'accountJwt',
            tags: ['api', 'internal'],
            description: 'Create a quizroom',
            notes: 'Creates a quiz namespace to host all events for the quiz',
            validate: {
                payload: Joi.object().required().keys({
                    quiz: Joi.object().keys({
                        quizId: Joi.string().description('The id for the quiz')
                    }).unknown(true).requiredKeys(['quizId']).description('Create a new room for a quiz'),
                })
            }
        },
        handler: async (req) => {
            const { quiz } = (req.payload as { quiz: { quizId: string } });
            const quizId = quiz.quizId;
            const quizNamespace = new QuizNamespace(ioServer.getNamespace(quizId), quiz as IQuizResponse);
            await quizNamespace.start();
            ioServer.server.emit(ServerEvents.quizStart, { quiz });
            return {
                quizId: quizNamespace.quizId
            };
        }
    });

    server.route({
        path: '/realtime/quizzes/{quizId}',
        method: 'GET',
        options: {
            auth: 'accountJwt',
            tags: ['api', 'internal'],
            description: 'Get a quizroom',
            notes: 'Returns quizId of quiz room if it exists 404 if it does not',
        },
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = await QuizCache.getQuiz(quizId);
            if (!quizNamespace) {
                return Boom.notFound();
            }
            return { quizId };
        }
    });

    server.route({
        path: '/realtime/quizzes/{quizId}:connected',
        method: 'GET',
        options: {
            auth: 'accountJwt',
            tags: ['api', 'internal'],
            description: 'Get number of connected users to a quiz room',
            notes: 'Returns the number of users that are currently connected to the quiz room',
        },
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = await getNamespace(quizId, ioServer);
            if (quizNamespace === null) {
                return Boom.notFound();
            }
            return {
                connecetdUsers: await quizNamespace.numConnected
            };
        }
    });

    server.route({
        path: '/realtime/quizzes/{quizId}/{eventType}:emit',
        method: 'POST',
        options: {
            auth: 'accountJwt',
            validate: {
                params: {
                    quizId: Joi.string().required().description('The id for the quiz to emit to'),
                    eventType: Joi.string().allow(['question', 'results', 'winners', 'complete']).required()
                }
            },
            tags: ['api', 'internal'],
            description: 'Emit event to a quizroom',
            notes: 'Sends an event of eventType to the quizroom, the payload will be sent as the event data',
        },
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const eventType: string = req.params['eventType'];
            const payload = req.payload || {};
            const quizNamespace = await getNamespace(quizId, ioServer);
            if (quizNamespace === null) {
                return Boom.notFound();
            }
            quizNamespace.namespace.emit(eventType, payload);
            return payload;
        }
    });

    server.route({
        path: '/realtime/quizzes/{quizId}',
        method: 'DELETE',
        options: {
            auth: 'accountJwt',
            tags: ['api', 'internal'],
            description: 'Delete a quizroom',
            notes: 'Removes a quizroom and disconnects all users',
        },
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = await getNamespace(quizId, ioServer);
            if (quizNamespace === null) {
                return Boom.notFound();
            }
            try {
                await quizNamespace.delete();
            } catch (e) {
                return Boom.internal();
            }
            return {
                message: 'ok'
            };
        }
    });
}