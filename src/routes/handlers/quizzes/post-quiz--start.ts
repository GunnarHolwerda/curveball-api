import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../../models/factories/quiz-factory';
import { createQt } from '../../../util/create-qt';
export async function postQuizzesStart(event: hapi.Request): Promise<object> {
    const quizId = event.params['quizId'];
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }
    quiz.properties.active = true;
    const questions = await quiz.getQuestions();
    const firstQuestion = questions[0];

    if (!firstQuestion) {
        throw Boom.badRequest('Cannot start quiz with zero questions');
    }

    await Promise.all([firstQuestion.start(), quiz.save()]);
    const token = createQt(quizId, firstQuestion.properties.question_id);

    return {
        quiz: await quiz.toResponseObject(),
        firstQuestion: await firstQuestion.toResponseObject(true),
        token: token // TODO: Remove once everyone is on V0.1.1
    };
}


