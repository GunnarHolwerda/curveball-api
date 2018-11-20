import { Postgres } from '../postgres';
import { Database } from './database';

export interface ILife {
    id: number;
    user_id: string;
    question: string;
}

export const LIFE_TABLE_NAME = 'lives';

export class Life {
    public properties: ILife;
    constructor(private _life: ILife) {
        this.properties = { ..._life };
    }

    public static async create(userId: string): Promise<boolean> {
        const result = await Database.instance.client.query(`INSERT INTO ${LIFE_TABLE_NAME} (user_id) VALUES ($1);`, [userId]);
        return result.rowCount === 1;
    }

    public async use(questionId: string): Promise<void> {
        this.properties.question = questionId;
        await this.save();
    }

    public async save(): Promise<void> {
        const updateString: string = Postgres.buildUpatePropertyString(this._life, this.properties);
        if (updateString) {
            await Database.instance.client.query(`
                UPDATE ${LIFE_TABLE_NAME}
                SET
                    ${updateString}
                WHERE id = $1;
            `, [this._life.id]);
        }
    }
}