import { SubjectType } from '../types/subject-type';

export interface SubjectSupplier {
    questionSubjectType(): SubjectType | false; // Returns false if it does not have a subject for this key
    choiceSubjectType(): SubjectType | false;
}