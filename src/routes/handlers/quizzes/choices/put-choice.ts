import * as Joi from '@hapi/joi';
import * as Boom from '@hapi/boom';
import * as hapi from '@hapi/hapi';
import { QuizFactory } from '../../../../models/factories/quiz-factory';
import { snakifyKeys } from '../../../../util/snakify-keys';
import { QuestionFactory } from '../../../../models/factories/question-factory';
import { ChoiceFactory } from '../../../../models/factories/choice-factory';

export interface ChoicePayload {
    choiceId?: string;
    questionId?: string;
    text?: string;
    subjectId?: number | null;
    score?: number;
    isAnswer?: boolean;
    data?: object;
}

interface SnakifiedChoicePayload {
    choice_id?: string;
    question_id?: string;
    text?: string;
    subject_id?: number | null;
    score?: number;
    is_answer?: boolean;
    data?: object;
}

export const putChoiceSchema = Joi.object().keys({
    choiceId: Joi.string().optional().description('The id of the choice'),
    questionId: Joi.string().optional().description('The quesiton id to associate with the choice'),
    text: Joi.string().max(64).optional().description('Text to be displayed with the choice'),
    isAnswer: Joi.boolean().optional().description('Whether the question is the answer or not'),
    subjectId: Joi.number().allow(null).optional().description('The subject id of the subject to associate with this choice'),
    score: Joi.number().optional().min(0).description('The score that the user will earn for selecting this if the question isAnswer'),
    data: Joi.object().unknown(true).allow(null).description('Additional metadata to store with the choice')
});

export async function putChoice(event: hapi.Request): Promise<object> {
    const { quizId, questionId, choiceId } = event.params;
    const payload = snakifyKeys(event.payload as ChoicePayload) as SnakifiedChoicePayload;
    const [quiz, question, choice] = await Promise.all([
        QuizFactory.load(quizId),
        QuestionFactory.load(questionId),
        ChoiceFactory.load(choiceId)
    ]);
    if (quiz === null || question === null || choice === null) {
        throw Boom.notFound();
    }

    const questionBelongsToQuiz = quiz.properties.quiz_id === question.properties.quiz_id;
    const choiceBelongsToQuestion = question.properties.question_id === choice.properties.question_id;
    if (!questionBelongsToQuiz || !choiceBelongsToQuestion) {
        throw Boom.notFound();
    }

    for (const property in payload) {
        if (payload.hasOwnProperty(property)) {
            choice.properties[property] = payload[property];
        }
    }

    await choice.save();

    return await choice.toResponseObject();
}


