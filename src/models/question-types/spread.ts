import { SubjectSupplier } from '../../interfaces/subject-supplier';
import { SubjectType } from '../../types/subject-type';
import { QuestionType } from '../entities/question-type';

export class SpreadQuestionType extends QuestionType implements SubjectSupplier {

    questionSubjectType(): SubjectType | false {
        return SubjectType.sportGame;
    }

    choiceSubjectType(): SubjectType | false {
        return SubjectType.sportTeam;
    }
}