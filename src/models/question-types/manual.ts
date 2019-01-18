import { QuestionType } from '../entities/question-type';
import { Scorer } from '../scorers/scorer';

export class ManualQuestionType extends QuestionType {
    public isSubjectSupplier(): boolean {
        return false;
    }

    public getScorerForQuestion(): Scorer | null {
        return null;
    }

}