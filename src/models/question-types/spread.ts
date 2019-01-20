import { SubjectSupplier } from '../../interfaces/subject-supplier';
import { QuestionType } from '../entities/question-type';
import { Subject, ISubject } from '../entities/subject';
import { ITopicResponse } from '../factories/topic-factory';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';

export class SpreadQuestionType extends QuestionType implements SubjectSupplier {
    isSubjectSupplier(): boolean {
        return true;
    }

    questionSubjects(topic: ITopicResponse): Promise<Array<Subject<ISubject>>> {
        return SubjectFactory.loadAllByTypeAndTopic(SubjectType.sportGame, topic.topicId);
    }

    choiceSubjects(topic: ITopicResponse): Promise<Array<Subject<ISubject>>> {
        return SubjectFactory.loadAllByTypeAndTopic(SubjectType.sportTeam, topic.topicId);
    }
}