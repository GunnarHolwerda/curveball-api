import * as hapi from 'hapi';
import { CurveballBadRequest } from '../../models/curveball-error';
import { QuizFactory } from '../../models/factories/quiz-factory';
import { createQt } from '../../models/qt';

export async function postQuizzesStart(event: hapi.Request): Promise<object> {
    const quizId = event.params['quizId'];
    const quiz = await QuizFactory.load(quizId);
    quiz.properties.active = true;
    const questions = await quiz.getQuestions();
    const firstQuestion = questions[0];

    if (!firstQuestion) {
        throw new CurveballBadRequest('Cannot start quiz with zero questions');
    }

    await Promise.all([firstQuestion.start(), quiz.save()]);
    const token = createQt(quizId, firstQuestion.properties.question_id);

    return {
        quiz: await quiz.toResponseObject(),
        firstQuestion: firstQuestion.toResponseObject(),
        token: token // TODO: Remove once everyone is on V0.1.1
    };
}


