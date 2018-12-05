import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { onlyLocalPreHandler } from './pres/only-local';
import * as Joi from 'joi';
import { QuestionFactory } from '../models/factories/question-factory';
import { User } from '../models/entities/user';
import * as Boom from 'boom';
import { Answer } from '../models/entities/answer';
import { generatePhone } from '../util/generate-phone';
import { Choice } from '../models/entities/question-choice';

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
        handler: async (req: hapi.Request) => {
            const { questionId, numAnswers } = req.payload as { questionId: string, numAnswers: number };
            const question = await QuestionFactory.load(questionId);
            if (!question) {
                throw Boom.notFound();
            }
            const choices = await question.choices();
            const percentageChoices: { [choiceId: string]: number } = {};
            let percentageLeft = 1;
            for (let i = 0; i < choices.length; i++) {
                const choice = choices[i];
                if (i === choices.length - 1) {
                    percentageChoices[choice.properties.choice_id] = percentageLeft;
                } else {
                    const percentageForChoice = Math.random() * percentageLeft;
                    percentageChoices[choice.properties.choice_id] = percentageForChoice;
                    percentageLeft -= percentageForChoice;
                }
            }
            const numSelected: { [choiceId: string]: number } = choices.reduce((carry, choice) => {
                carry[choice.properties.choice_id] = 0;
                return carry;
            }, {});

            const getRandomChoice = (): Choice => {
                return choices[Math.floor(Math.random() * choices.length)];
            };

            const answerPromises: Array<Promise<any>> = [];
            const quizId = question.properties.quiz_id;
            for (let i = 0; i < numAnswers; i++) {
                answerPromises.push(new Promise((res, rej) => {
                    User.create(generatePhone()).then(u => {
                        let choice = getRandomChoice();
                        while ((numSelected[choice.properties.choice_id] / numAnswers) > percentageChoices[choice.properties.choice_id]) {
                            choice = getRandomChoice();
                        }
                        numSelected[choice.properties.choice_id]++;
                        Answer.create(quizId, questionId, u.properties.user_id, choice.properties.choice_id).then((a) => {
                            res(a);
                        }).catch(rej);
                    }).catch(rej);
                }));
            }
            try {
                await Promise.all(answerPromises);
                return {
                    ...percentageChoices
                };
            } catch (e) {
                console.error(e);
                throw Boom.internal('Something went wrong generating answers');
            }
        }
    });
}