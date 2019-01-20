import { SubjectSupplier } from '../../interfaces/subject-supplier';
import { SubjectType } from '../../types/subject-type';
import { QuestionType } from '../entities/question-type';

export class FantasyQuestionType extends QuestionType implements SubjectSupplier {
    isSubjectSupplier(): boolean {
        return true;
    }

    questionSubjectType(): SubjectType | false {
        return false;
    }

    choiceSubjectType(): SubjectType | false {
        return SubjectType.sportPlayer;
    }
}