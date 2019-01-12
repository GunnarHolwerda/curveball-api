
import * as hapi from 'hapi';
import * as Joi from 'joi';
import * as Boom from 'boom';
import { TopicFactory } from '../../../models/factories/topic-factory';
import { QuestionTypeFactory } from '../../../models/factories/question-type-factory';
import { SubjectSupplier } from '../../../interfaces/subject-supplier';
import { SubjectFactory } from '../../../models/factories/subject-factory';
import { Subject, ISubject } from '../../../models/entities/subject';

export const getSubjectsQuerySchema = {
    topicId: Joi.number().required().description('The topic id to retrieve related subjects for'),
    typeId: Joi.number().required().description('The question type to filter down subjects to')
};

export async function getSubjects(event: hapi.Request): Promise<object> {
    const { topicId, typeId } = event.query as { topicId: string, typeId: string };
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

    const questionSubjectType = subjectSupplier.questionSubjectType();
    let questionSubjects: Array<Subject<ISubject>> | undefined;
    if (questionSubjectType) {
        questionSubjects = await SubjectFactory.loadAllByTypeAndTopic(questionSubjectType, numericTopicId);
    }
    const choiceSubjectType = subjectSupplier.choiceSubjectType();
    let choiceSubjects: Array<Subject<ISubject>> | undefined;
    if (choiceSubjectType) {
        choiceSubjects = await SubjectFactory.loadAllByTypeAndTopic(choiceSubjectType, numericTopicId);
    }

    return {
        questionSubjectType,
        choiceSubjectType,
        choiceSubjects,
        questionSubjects
    };
}


