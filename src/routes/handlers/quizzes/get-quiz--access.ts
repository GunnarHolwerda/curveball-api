import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../../models/factories/quiz-factory';
import { createQt } from '../../../util/create-qt';

export async function getQuizAccess(event: hapi.Request): Promise<{ token: string | null }> {
    const quizId: string = event.params.quizId;
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }

    if (!quiz.properties.auth) {
        return {
            token: createQt(quiz.properties.quiz_id, '')
        };
    }

    const firstQuestion = (await quiz.getQuestions()).shift()!;
    if (!firstQuestion) {
        throw Boom.internal('Quiz has no questions');
    }

    if (!firstQuestion || firstQuestion.isExpired()) {
        return { token: null };
    }

    return {
        token: createQt(quizId, firstQuestion.properties.question_id)
    };
}


