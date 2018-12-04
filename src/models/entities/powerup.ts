import { Database } from '../database';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { omit } from '../../util/omit';

export interface IPowerup {
    id: number;
    user_id: string;
    question: string;
}

export const POWERUP_TABLE_NAME = 'powerup';

export class Powerup implements Analyticize {
    public properties: IPowerup;
    constructor(private _powerup: IPowerup) {
        this.properties = { ..._powerup };
    }

    public static async create(userId: string): Promise<boolean> {
        const sq = Database.instance.sq;
        const result = await sq.from(POWERUP_TABLE_NAME).insert({ user_id: userId });
        return result.length === 1;
    }

    public async use(questionId: string): Promise<void> {
        this.properties.question = questionId;
        await this.save();
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(POWERUP_TABLE_NAME).set({ ...omit(this.properties, ['id']) }).where`id = ${this._powerup.id}`;
    }

    public analyticsProperties(): AnalyticsProperties {
        return {
            id: this.properties.id,
            type: 'life'
        };
    }
}