import * as hapi from 'hapi';
import { QuizFactory } from '../../models/factories/quiz-factory';
import { createQt } from '../../models/qt';
import { CurveballError } from '../../models/curveball-error';

export async function getQuizAccess(event: hapi.Request): Promise<{ token: string | null }> {
    const quizId: string = event.path['quizId'];
    const quiz = await QuizFactory.load(quizId);

    if (!quiz.properties.auth) {
        return {
            token: createQt(quiz.properties.quiz_id, '')
        };
    }

    const firstQuestion = (await quiz.getQuestions()).shift()!;
    if (!firstQuestion) { throw new CurveballError('Quiz has no questions'); };

    if (!firstQuestion || firstQuestion.isExpired()) {
        return { token: null };
    }

    return {
        token: createQt(quizId, firstQuestion.properties.question_id)
    };
}


