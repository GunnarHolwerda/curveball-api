
import * as hapi from '@hapi/hapi';
import * as Joi from '@hapi/joi';
import * as Boom from '@hapi/boom';
import { TopicFactory } from '../../../models/factories/topic-factory';
import { QuestionTypeFactory } from '../../../models/factories/question-type-factory';
import { SubjectSupplier, SubjectSupplierOptions } from '../../../interfaces/subject-supplier';

export const getSubjectsQuerySchema = {
    topicId: Joi.number().required().description('The topic id to retrieve related subjects for'),
    typeId: Joi.number().required().description('The question type to filter down subjects to'),
    startDate: Joi.string().optional().description('Only load subjects relevant after this date. This may not apply to certain subjects'),
    endDate: Joi.string().optional().description('Only load subjects relevant before this date. This may not apply to certain subjects'),
};

interface GetSubjectsQueryParams {
    topicId: string;
    typeId: string;
    startDate?: string;
    endDate?: string;
}

export async function getSubjects(event: hapi.Request): Promise<object> {
    const { topicId, typeId, startDate, endDate } = event.query as unknown as GetSubjectsQueryParams;
    const numericTypeId = parseInt(typeId, 10);
    const numericTopicId = parseInt(topicId, 10);
    const [type, topic] = await Promise.all([
        QuestionTypeFactory.load(numericTypeId),
        TopicFactory.load(numericTopicId)
    ]);

    if (type === null || topic === null) {
        throw Boom.notFound();
    }

    if (!type.isSubjectSupplier()) {
        throw Boom.badRequest();
    }

    const subjectSupplier = (type as unknown) as SubjectSupplier;
    const supplierOptions: SubjectSupplierOptions = {
        startDate: startDate ? new Date(Date.parse(startDate)) : undefined,
        endDate: endDate ? new Date(Date.parse(endDate)) : undefined
    };
    const [questionSubjects, choiceSubjects] = await Promise.all([
        subjectSupplier.questionSubjects(topic, supplierOptions),
        subjectSupplier.choiceSubjects(topic, supplierOptions)
    ]);

    // TODO: Solve n+1 problem
    return {
        choiceSubjects: choiceSubjects ? await Promise.all(choiceSubjects.map(s => s.toResponseObject())) : undefined,
        questionSubjects: questionSubjects ? await Promise.all(questionSubjects.map(s => s.toResponseObject())) : undefined,
    };
}


