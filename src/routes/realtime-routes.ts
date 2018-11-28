import * as Boom from 'boom';
import * as hapi from 'hapi';
import * as Joi from 'joi';

import { IoServer } from '../models/io-server';
import { QuizNamespace } from '../models/quiz-namespace';
import { QuizCache } from '../models/quiz-cache';
import { ServerEvents } from '../events';

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
            auth: 'internalJwt',
            tags: ['api', 'internal'],
            description: 'Create a quizroom',
            notes: 'Creates a quiz namespace to host all events for the quiz',
            validate: {
                payload: Joi.object().required().keys({
                    quiz: Joi.object()
                        .keys({
                            quizId: Joi.string(),
                            title: Joi.string(),
                            potAmount: Joi.number(),
                            numQuestions: Joi.number()
                        })
                        .requiredKeys(['quizId'])
                        .options({ stripUnknown: true })
                        .description('Create a new room for a quiz'),
                    ticker: Joi.array()
                        .items(
                            Joi.object().keys({
                                ticker: Joi.string().required(),
                                sport: Joi.string().required()
                            })
                        ).required().description('The ticker for the questions for the quiz')
                })
            }
        },
        handler: async (req) => {
            const quiz = req.payload['quiz'];
            const ticker = req.payload['ticker'];
            const { quizId } = quiz;
            const quizNamespace = new QuizNamespace(ioServer.getNamespace(quizId), quiz);
            quizNamespace.start();
            ioServer.server.emit(ServerEvents.quizStart, { quiz, ticker });
            return {
                quizId: quizNamespace.quizId
            };
        }
    });

    server.route({
        path: '/realtime/quizzes/{quizId}',
        method: 'GET',
        options: {
            auth: 'internalJwt',
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
            auth: 'internalJwt',
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
        },
        options: {
            auth: 'internalJwt',
            validate: {
                params: {
                    quizId: Joi.string().required().description('The id for the quiz to emit to'),
                    eventType: Joi.string().allow(['question', 'results', 'winners', 'complete']).required()
                }
            },
            tags: ['api', 'internal'],
            description: 'Emit event to a quizroom',
            notes: 'Sends an event of eventType to the quizroom, the payload will be sent as the event data',
        }
    });

    server.route({
        path: '/realtime/quizzes/{quizId}',
        method: 'DELETE',
        options: {
            auth: 'internalJwt',
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