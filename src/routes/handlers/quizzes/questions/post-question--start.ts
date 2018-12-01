import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuestionFactory } from '../../../../models/factories/question-factory';

export async function postQuestionStart(event: hapi.Request): Promise<object> {
    const { quizId, questionId } = event.params;
    const question = await QuestionFactory.load(questionId);

    if (!question || question.properties.quiz_id !== quizId) {
        throw Boom.notFound();
    }

    await question.start();

    return {
        question: await question.toResponseObject(true)
    };
}


