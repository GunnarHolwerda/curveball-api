
import * as hapi from 'hapi';
import * as Joi from 'joi';
import * as Boom from 'boom';
import { TopicFactory } from '../../../models/factories/topic-factory';
import { QuestionTypeFactory } from '../../../models/factories/question-type-factory';
import { SubjectSupplier } from '../../../interfaces/subject-supplier';

export const getSubjectsQuerySchema = {
    topicId: Joi.number().required().description('The topic id to retrieve related subjects for'),
    typeId: Joi.number().required().description('The question type to filter down subjects to')
};

export async function getSubjects(event: hapi.Request): Promise<object> {
    const { topicId, typeId } = event.query as { topicId: string, typeId: string };
    const [type, topic] = await Promise.all([
        QuestionTypeFactory.load(parseInt(typeId, 10)),
        TopicFactory.load(parseInt(topicId, 10))
    ]);

    if (type === null || topic === null) {
        throw Boom.notFound();
    }

    if (!type.isSubjectSupplier()) {
        throw Boom.badRequest();
    }

    const subjectSupplier = (type as unknown) as SubjectSupplier;

    const questionSubjectType = subjectSupplier.questionSubjectType();
    const choiceSubjectType = subjectSupplier.choiceSubjectType();
    return {
        questionSubjectType,
        choiceSubjectType
    };
}


