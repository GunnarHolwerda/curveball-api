import * as hapi from 'hapi';
import { CurveballNotFound } from '../../../models/curveball-error';
import { QuestionFactory } from '../../../models/factories/question-factory';

export async function postQuestionStart(event: hapi.Request): Promise<object> {
    const { quizId, questionId } = event.params;
    const question = await QuestionFactory.load(questionId);

    if (!question) {
        throw new CurveballNotFound();
    }

    if (question.properties.quiz_id !== quizId) {
        throw new CurveballNotFound();
    }

    await question.start();

    return {
        question: question.toResponseObject()
    };
}


