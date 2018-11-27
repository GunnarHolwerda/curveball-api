import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuestionFactory } from '../../../models/factories/question-factory';

export async function getQuestionResults(event: hapi.Request): Promise<object> {
    const { questionId, quizId } = event.params;
    const question = await QuestionFactory.load(questionId);

    if (!question) {
        throw Boom.notFound();
    }

    if (question.properties.quiz_id !== quizId) {
        throw Boom.notFound();
    }

    return await question.results();
}


