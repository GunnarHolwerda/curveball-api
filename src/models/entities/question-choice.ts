import { ChoiceFactory } from '../factories/choice-factory';
import { Database } from '../database';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { snakifyKeys } from '../../util/snakify-keys';
import { omit } from '../../util/omit';
import { camelizeKeys } from '../../util/camelize-keys';

export interface IChoice {
    choice_id: string;
    question_id: string;
    text: string;
    is_answer: boolean;
}

export interface IChoiceResponse {
    choiceId: string;
    questionId: string;
    text: string;
    isAnswer?: boolean;
}

export const CHOICES_TABLE_NAME = 'questions_choices';

export class Choice implements Analyticize {
    public properties: IChoice;

    constructor(private _choice: IChoice) {
        this.properties = { ...this._choice };
    }

    public static async create(choice: Partial<IChoice>): Promise<Choice> {
        const params = snakifyKeys(choice);
        const sq = Database.instance.sq;
        const result = await sq.from(CHOICES_TABLE_NAME).insert(params).return`choice_id`;
        return (await ChoiceFactory.load(result![0].choice_id))!;
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(CHOICES_TABLE_NAME).set({ ...omit(this.properties, ['choice_id']) }).where`choice_id = ${this._choice.choice_id}`;
    }

    public toResponseObject(): object {
        const response = {
            ...omit(this.properties, ['is_answer']),
        };
        return camelizeKeys(response);
    }

    public analyticsProperties(): AnalyticsProperties {
        return {
            choice_id: this.properties.choice_id,
            text: this.properties.text,
            is_answer: this.properties.is_answer
        };
    }
}