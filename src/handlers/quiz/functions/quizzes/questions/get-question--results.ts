import * as hapi from 'hapi';
import { CurveballNotFound } from '../../../models/curveball-error';
import { QuestionFactory } from '../../../models/factories/question-factory';

export async function getQuestionResults(event: hapi.Request): Promise<object> {
    const { questionId, quizId } = event.params;
    const question = await QuestionFactory.load(questionId);

    if (!question) {
        throw new CurveballNotFound();
    }

    if (question.properties.quiz_id !== quizId) {
        throw new CurveballNotFound();
    }

    return await question.results();
}


