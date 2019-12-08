import { Database } from '../database';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { snakifyKeys } from '../../util/snakify-keys';
import { omit } from '../../util/omit';
import { camelizeKeys } from '../../util/camelize-keys';
import { QuestionFactory } from '../factories/question-factory';
import { Question } from './question';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { SubjectFactory } from '../factories/subject-factory';

export interface IChoice<T = null> {
    choice_id: string;
    question_id: string;
    text: string;
    is_answer: boolean;
    subject_id: number | null;
    score: number | null;
    data: T;
}

export interface IChoiceResponse<TSubject = SubjectTableResponse | null> {
    choiceId: string;
    questionId: string;
    text: string;
    subject: TSubject;
    isAnswer?: boolean;
}

export const CHOICES_TABLE_NAME = 'questions_choices';

export class Choice<TData = null> implements Analyticize {
    public properties: IChoice<TData>;

    constructor(private _choice: IChoice<TData>) {
        this.properties = { ...this._choice };
    }

    public static async create(choice: Partial<IChoice>): Promise<string> {
        const params = snakifyKeys(choice);
        const sq = Database.instance.sq;
        const result = await sq.from(CHOICES_TABLE_NAME).insert(params).return`choice_id`;
        return result![0].choice_id!;
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(CHOICES_TABLE_NAME).set({ ...omit(this.properties, ['choice_id']) }).where`choice_id = ${this._choice.choice_id}`;
    }

    public async toResponseObject<T>(): Promise<IChoiceResponse<T>> {
        const { subject_id } = this.properties;

        const response = {
            ...omit<object>(this.properties, ['is_answer', 'subject_id', 'data']),
            subject: subject_id ? await SubjectFactory.loadById(subject_id) : null
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

    public get question(): Promise<Question> {
        return (async () => {
            return (await QuestionFactory.load(this.properties.question_id))!;
        })();
    }
}