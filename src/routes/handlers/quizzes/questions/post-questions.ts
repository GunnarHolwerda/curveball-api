import * as Joi from 'joi';
import * as Boom from 'boom';
import * as hapi from 'hapi';
import { IChoiceResponse, IChoice, Choice } from '../../../../models/entities/question-choice';
import { IQuestion, Question } from '../../../../models/entities/question';
import { QuizFactory } from '../../../../models/factories/quiz-factory';
import { snakifyKeys } from '../../../../util/snakify-keys';

export interface QuestionPayload {
    question: string;
    questionNum: number;
    ticker: string;
    topic: number;
    typeId: number;
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
        question: Joi.string().max(64).required(),
        questionNum: Joi.number().min(1).required(),
        topic: Joi.number().required().description('The id of the topic the question relates to'),
        typeId: Joi.number().required().description('The id of the question type'),
        ticker: Joi.string().max(24).required().description('Ticker text for the question'),
        choices: Joi.array().optional().items(Joi.object().keys({
            text: Joi.string().max(64).required(),
            isAnswer: Joi.boolean().required()
        }).unknown(false))
    }).unknown(false).required())
});

export async function postQuestions(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const payload = snakifyKeys(event.payload as object) as SnakifiedQuestionsPayload;
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }

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


