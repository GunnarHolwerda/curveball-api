import { ISubject, Subject } from '../models/entities/subject';
import { ITopicResponse } from '../models/factories/topic-factory';

export interface SubjectSupplierOptions {
    startDate?: Date;
    endDate?: Date;
}

export interface SubjectSupplier {
    questionSubjects(topic: ITopicResponse, options?: SubjectSupplierOptions): Promise<Array<Subject<ISubject>>>;
    choiceSubjects(topic: ITopicResponse, options?: SubjectSupplierOptions): Promise<Array<Subject<ISubject>>>;
}