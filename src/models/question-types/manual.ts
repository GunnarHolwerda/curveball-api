import { QuestionType } from '../entities/question-type';

export class ManualQuestionType extends QuestionType {
    public isSubjectSupplier(): boolean {
        return false;
    }

}