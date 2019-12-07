import { SubjectSupplier, SubjectSupplierOptions } from '../../interfaces/subject-supplier';
import { QuestionType } from '../entities/question-type';
import { Subject, ISubject } from '../entities/subject';
import { ITopicResponse } from '../factories/topic-factory';
import { SubjectType } from '../../types/subject-type';
import { subjectLoader } from './loaders/subject-loader';


export class SpreadQuestionType extends QuestionType implements SubjectSupplier {
    isSubjectSupplier(): boolean {
        return true;
    }

    questionSubjects(topic: ITopicResponse, options: SubjectSupplierOptions): Promise<Array<Subject<ISubject>>> {
        return subjectLoader(topic, SubjectType.sportGame, options);
    }

    choiceSubjects(topic: ITopicResponse, options: SubjectSupplierOptions): Promise<Array<Subject<ISubject>>> {
        return subjectLoader(topic, SubjectType.sportTeam, options);
    }
}