import * as Boom from 'boom';
import * as hapi from 'hapi';
import * as Joi from 'joi';

import { IoServer } from '../models/io-server';
import { QuizNamespace } from '../models/quiz-namespace';
import { QuizCache } from '../models/quiz-cache';

async function getNamespace(quizId: string, ioServer: IoServer): Promise<QuizNamespace | null> {
    const quiz = await QuizCache.getQuiz(quizId);
    if (!quiz) {
        return null;
    }
    const namespace = ioServer.getNamespace(quizId);
    return new QuizNamespace(namespace, quiz!);
}

export function quizRoutes(server: hapi.Server, ioServer: IoServer): void {
    server.route({
        path: '/quizzes',
        method: 'POST',
        options: {
            validate: {
                payload: Joi.object().required().keys({
                    quiz: Joi.object()
                        .keys({
                            quizId: Joi.string(),
                            title: Joi.string(),
                            potAmount: Joi.number()
                        })
                        .requiredKeys(['quizId'])
                        .options({ stripUnknown: true })
                        .description('Create a new room for a quiz')
                })
            }
        },
        handler: async (req) => {
            const quiz = req.payload['quiz'];
            const { quizId } = quiz;
            const quizNamespace = new QuizNamespace(ioServer.getNamespace(quizId), quiz);
            console.log(quizNamespace);
            console.log('Creating quiz namespace');
            quizNamespace.start();
            console.log('Sending start event');
            ioServer.server.emit('start', quiz);
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
            const quizNamespace = await QuizCache.getQuiz(quizId);
            if (!quizNamespace) {
                return Boom.notFound();
            }
            return { quizId };
        }
    });

    server.route({
        path: '/quizzes/{quizId}:connected',
        method: 'GET',
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
        path: '/quizzes/{quizId}/{eventType}:emit',
        method: 'POST',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const eventType: string = req.params['eventType'];
            const quizNamespace = await getNamespace(quizId, ioServer);
            if (quizNamespace === null) {
                return Boom.notFound();
            }
            console.log(quizNamespace);
            console.log(`Emitting ${eventType}`, req.payload);
            quizNamespace.namespace.emit(eventType, req.payload);
            return req.payload;
        },
        options: {
            validate: {
                params: {
                    quizId: Joi.string().required().description('The id for the quiz to emit to'),
                    eventType: Joi.string().allow(['question', 'results', 'winners']).required()
                }
            }
        }
    });

    server.route({
        path: '/quizzes/{quizId}',
        method: 'DELETE',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const quizNamespace = await getNamespace(quizId, ioServer);
            if (quizNamespace === null) {
                return Boom.notFound();
            }
            try {
                console.log('deleting namespace');
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