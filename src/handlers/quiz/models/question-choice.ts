import { Postgres } from '../postgres';
import { omit } from '../util/omit';
import { ChoiceFactory } from './factories/choice-factory';
import { Database } from './database';
import { snakifyKeys } from '../util/snakify-keys';
import { camelizeKeys } from '../util/camelize-keys';

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

export class Choice {
    public properties: IChoice;

    constructor(private _choice: IChoice) {
        this.properties = { ...this._choice };
    }

    public static async create(choice: Partial<IChoice>): Promise<Choice> {
        const params = snakifyKeys(choice);
        const result = await Database.instance.client.query(`
            INSERT INTO ${CHOICES_TABLE_NAME} (question_id, text, is_answer)
            VALUES ($1, $2, $3)
            RETURNING choice_id;
        `, [params.question_id, params.text, params.is_answer]);
        return ChoiceFactory.load(result!.rows[0].choice_id);
    }

    public async save(): Promise<void> {
        await Database.instance.client.query(`
            UPDATE ${CHOICES_TABLE_NAME}
            SET
                ${Postgres.buildUpatePropertyString(this._choice, this.properties)}
            WHERE choice_id = $1;
        `, [this._choice.choice_id]);
    }

    public toResponseObject(): object {
        const response = {
            ...omit(this.properties, ['is_answer']),
        };
        return camelizeKeys(response);
    }
}