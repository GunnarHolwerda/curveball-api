
import { Database } from '../database';
import { QuestionCalculator, QUESTION_CALCULATOR_TABLE_NAME, IQuestionCalculator } from '../entities/question-calculator';

export class QuestionCalculatorFactory {
    public static async load(calculatorId: number): Promise<QuestionCalculator | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_CALCULATOR_TABLE_NAME).where`calculator_id = ${calculatorId}`;

        if (result.length === 0) {
            return null;
        }
        return new QuestionCalculator(result[0] as IQuestionCalculator);
    }
}