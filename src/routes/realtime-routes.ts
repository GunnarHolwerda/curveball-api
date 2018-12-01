import * as Boom from 'boom';
import * as hapi from 'hapi';
import * as Joi from 'joi';

import { IoServer } from '../models/namespaces/io-server';
import { QuizNamespace } from '../models/namespaces/quiz-namespace';
import { QuizCache } from '../models/quiz-cache';
import { ServerEvents } from '../types/events';
import { IQuizRoom } from '../interfaces/quiz';

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
            const quiz: IQuizRoom = req.payload['quiz'];
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
        options: { auth: 'internalJwt' },
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
        options: { auth: 'internalJwt' },
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
            }
        }
    });

    server.route({
        path: '/realtime/quizzes/{quizId}',
        method: 'DELETE',
        options: { auth: 'internalJwt' },
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