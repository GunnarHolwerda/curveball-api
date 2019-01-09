import * as hapi from 'hapi';
import { QuestionTypeFactory } from '../../../../models/factories/question-type-factory';

export async function getQuestionTypes(_: hapi.Request): Promise<object> {
    const types = await QuestionTypeFactory.loadAll();

    const responseObjects = await Promise.all(types.map(t => t.toResponseObject()));

    return { types: responseObjects };
}


