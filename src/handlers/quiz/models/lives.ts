import { Dynamo } from './dynamo';
import { String } from 'aws-sdk/clients/lambda';
import { StoredRecord } from './stored-record';
import { IUserResponse } from './user';
export interface ILife extends StoredRecord {
    lifeId: String;
    userId: string;
    referredUserId: string;
    referredUser: IUserResponse;
    question?: string;
}

export const LIFE_TABLE_NAME: string = process.env.LIFE_TABLE!;

export class Life {
    public properties: ILife;
    constructor(private _life: ILife) {
        this.properties = { ..._life };
    }

    public static async create(properties: Partial<ILife>): Promise<Life> {
        const life = await Dynamo.createItem<ILife>(LIFE_TABLE_NAME, 'lifeId', properties);
        return new Life(life);
    }

    public async use(questionId: string): Promise<void> {
        this.properties.question = questionId;
        await this.save();
    }

    public async save(): Promise<void> {
        if (JSON.stringify(this._life) !== JSON.stringify(this.properties)) {
            this.properties = await Dynamo.updateItem<ILife>(LIFE_TABLE_NAME, 'lifeId', this.properties);
        }
    }
}