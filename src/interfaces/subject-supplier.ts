import { ISubject, Subject } from '../models/entities/subject';
import { ITopicResponse } from '../models/factories/topic-factory';

export interface SubjectSupplier {
    questionSubjects(topic: ITopicResponse): Promise<Array<Subject<ISubject>>>;
    choiceSubjects(topic: ITopicResponse): Promise<Array<Subject<ISubject>>>;
}