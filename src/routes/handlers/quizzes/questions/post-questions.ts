import * as Joi from 'joi';
import * as Boom from 'boom';
import * as hapi from 'hapi';
import { IChoice, Choice } from '../../../../models/entities/question-choice';
import { IQuestion, Question } from '../../../../models/entities/question';
import { QuizFactory } from '../../../../models/factories/quiz-factory';
import { snakifyKeys } from '../../../../util/snakify-keys';
import { QuestionFactory } from '../../../../models/factories/question-factory';
import { ChoiceFactory } from '../../../../models/factories/choice-factory';

export interface QuestionPayload {
    question: string;
    questionNum: number;
    ticker: string;
    topic: number;
    typeId: number;
    subjectId?: number;
    choices: Array<ChoicePayload>;
}

export interface ChoicePayload {
    text: string;
    subjectId?: number | null;
    isAnswer: boolean;
}
export interface QuestionsPayload {
    questions: Array<QuestionPayload>;
}

interface SnakifiedQuestionsPayload {
    questions: Array<Partial<IQuestion> & { choices: Array<Partial<IChoice>> }>;
}

export const postQuestionsSchema = Joi.object().keys({
    questions: Joi.array().required().items(Joi.object().keys({
        question: Joi.string().max(64).required().description('The actual question text'),
        questionNum: Joi.number().min(1).required().description('Which question number this should be'),
        topic: Joi.number().required().description('The id of the topic the question relates to'),
        typeId: Joi.number().required().description('The id of the question type'),
        ticker: Joi.string().max(24).required().description('Ticker text for the question'),
        subjectId: Joi.number().allow(null).optional().description('The id of the subject this question relates to'),
        choices: Joi.array().optional().items(Joi.object().keys({
            text: Joi.string().max(64).required().description('Text to be displayed with the choice'),
            isAnswer: Joi.boolean().required().description('Whether the question is the answer or not'),
            subjectId: Joi.number().allow(null).optional().description('The subject id of the subject to associate with this choice')
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
        const questionId = await Question.create({ ...(questionToCreate as Partial<IQuestion>), quiz_id: quizId });
        const q = (await QuestionFactory.load(questionId))!;
        createdQuestions.push(q);

        const choicePromises: Array<Promise<Choice>> = [];
        question.choices.forEach(c => {
            choicePromises.push(Choice.create({ ...c, question_id: q.properties.question_id }).then(id => {
                return ChoiceFactory.load(id) as Promise<Choice>;
            }));
        });

        await Promise.all(choicePromises);
    }

    const questions = await quiz.getQuestions();
    const questionResponses = await Promise.all(questions.map(async (q) => q.toResponseObject(true)));

    return {
        questions: questionResponses
    };
}


