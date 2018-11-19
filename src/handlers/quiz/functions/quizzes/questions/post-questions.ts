import * as Joi from 'joi';

import * as hapi from 'hapi';
import { IQuestion, Question } from '../../../models/question';
import { IChoice, IChoiceResponse, Choice } from '../../../models/question-choice';
import { QuizFactory } from '../../../models/factories/quiz-factory';

export interface QuestionPayload {
    question: string;
    questionNum: number;
    ticker: string;
    sport: string;
    choices: Array<Partial<IChoiceResponse>>;
}
export interface QuestionsPayload {
    questions: Array<QuestionPayload>;
}

interface SnakifiedQuestionsPayload {
    questions: Array<Partial<IQuestion> & { choices: Array<Partial<IChoice>> }>;
}

export const postQuestionsSchema = Joi.object().keys({
    questions: Joi.array().required().items(Joi.object().keys({
        question: Joi.string().required(),
        questionNum: Joi.number().required(),
        sport: Joi.string().max(64).required().description('The sport the question relates to'),
        ticker: Joi.string().max(64).required().description('Ticker text for the question'),
        choices: Joi.array().optional().items(Joi.object().keys({
            text: Joi.string().required(),
            isAnswer: Joi.boolean().required()
        }).unknown(false))
    }).unknown(false).required())
});

export async function postQuestions(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const payload = event.payload as SnakifiedQuestionsPayload;
    const quiz = await QuizFactory.load(quizId);

    const createdQuestions: Array<Question> = [];
    for (const question of payload.questions) {
        const questionToCreate = { ...question };
        delete questionToCreate.choices;
        const q = await Question.create({ ...(questionToCreate as Partial<IQuestion>), quiz_id: quizId });
        createdQuestions.push(q);

        const choicePromises: Array<Promise<Choice>> = [];
        question.choices.forEach(c => {
            choicePromises.push(Choice.create({ ...c, question_id: q.properties.question_id }));
        });

        await Promise.all(choicePromises);
    }

    const questions = await quiz.getQuestions();
    const questionResponses = await Promise.all(questions.map(async (q) => q.toResponseObject(true)));

    return {
        questions: questionResponses
    };
}

