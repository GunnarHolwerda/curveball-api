import * as Boom from 'boom';
import * as hapi from 'hapi';
import * as Joi from 'joi';

import { IoServer } from '../models/io-server';
import { QuizNamespace } from '../models/quiz-namespace';

export function quizRoutes(server: hapi.Server, ioServer: IoServer): void {
    server.route({
        path: '/quizzes',
        method: 'POST',
        options: {
            validate: {
                payload: Joi.object().required().keys({
                    quiz: Joi.object()
                        .required()
                        .keys({
                            quizId: Joi.string(),
                            title: Joi.string(),
                            potAmount: Joi.number()
                        })
                        .requiredKeys(['quizId'])
                        .options({ stripUnknown: true })
                        .description('A newly begun quiz')
                })
            }
        },
        handler: async (req) => {
            const quiz = req.payload['quiz'];
            const { quizId } = quiz;
            const ns = ioServer.server.of(`/${quizId}`);
            const quizNamespace = new QuizNamespace(quiz, ns);
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
            const quizNamespace = QuizNamespace.Get(quizId);
            if (!quizNamespace) {
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
                connecetdUsers: QuizNamespace.Get(quizId).numConnected
            };
        }
    });

    server.route({
        path: '/quizzes/{quizId}/{eventType}:emit',
        method: 'POST',
        handler: async (req) => {
            const quizId: string = req.params['quizId'];
            const eventType: string = req.params['eventType'];
            const quizNamespace = QuizNamespace.Get(quizId);
            if (!quizNamespace) {
                return Boom.notFound();
            }
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
            const quizNamespace = QuizNamespace.Get(quizId);
            if (!quizNamespace) {
                return Boom.notFound();
            }
            try {
                quizNamespace.delete();
            } catch (e) {
                return Boom.internal();
            }
            return {
                message: 'ok'
            };
        }
    });
}