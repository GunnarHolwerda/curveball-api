import { Database } from '../database';
import { camelizeKeys } from '../../util/camelize-keys';
import { omit } from '../../util/omit';

export interface IQuestionCalculator {
    calculator_id: number;
    type_id: number;
    function_name: string;
    topic: number;
}

export interface IQuestionCalculatorResponse {
    calculatorId: number;
    topic: number;
    typeId: number;
}

export const QUESTION_CALCULATOR_TABLE_NAME = 'question_calculator';

export class QuestionCalculator {
    public properties: IQuestionCalculator;

    constructor(private _questionType: IQuestionCalculator) {
        this.properties = { ...this._questionType };
    }

    public static async create(qt: Pick<IQuestionCalculator, 'type_id' | 'function_name' | 'topic'>): Promise<number> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_CALCULATOR_TABLE_NAME).insert({ ...qt }).return`calculator_id`;
        return result[0].calculator_id;
    }

    public toResponseObject(): Promise<IQuestionCalculator> {
        return camelizeKeys({
            ...omit(this.properties, ['function_name'])
        });
    }
}