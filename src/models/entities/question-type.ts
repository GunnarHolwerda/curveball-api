import { Database } from '../database';
import { camelizeKeys } from '../../util/camelize-keys';
import { QuestionTypeMachineNames } from '../../types/question-type-machine-names';

export enum KnownQuestionTypes {
    manual = 1
}

export interface IQuestionType {
    id: number;
    title: string;
    description: string;
    generic: boolean;
    machine_name: QuestionTypeMachineNames | string;
}

export interface IQuestionTypeResponse {
    id: number;
    title: string;
    description: string;
    generic: boolean;
    machineName: string;
}

export const QUESTION_TYPE_TABLE_NAME = 'question_type';

export abstract class QuestionType {
    public properties: IQuestionType;

    constructor(private _questionType: IQuestionType) {
        this.properties = { ...this._questionType };
    }

    public static async create(qt: Pick<IQuestionType, 'title' | 'description' | 'generic' | 'machine_name'>): Promise<number> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_TYPE_TABLE_NAME).insert({ ...qt }).return`id`;
        return result[0].id;
    }

    public toResponseObject(): Promise<IQuestionTypeResponse> {
        return camelizeKeys({
            ...this.properties
        });
    }

    public abstract isSubjectSupplier(): boolean;
}