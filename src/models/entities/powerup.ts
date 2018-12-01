import { Database } from '../database';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { buildUpatePropertyString } from '../../util/build-update-property-string';

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
        const result = await Database.instance.client.query(`INSERT INTO ${POWERUP_TABLE_NAME} (user_id) VALUES ($1);`, [userId]);
        return result.rowCount === 1;
    }

    public async use(questionId: string): Promise<void> {
        this.properties.question = questionId;
        await this.save();
    }

    public async save(): Promise<void> {
        const updateString: string = buildUpatePropertyString(this._powerup, this.properties);
        if (updateString) {
            await Database.instance.client.query(`
                UPDATE ${POWERUP_TABLE_NAME}
                SET
                    ${updateString}
                WHERE id = $1;
            `, [this._powerup.id]);
        }
    }

    public analyticsProperties(): AnalyticsProperties {
        return {
            id: this.properties.id,
            type: 'life'
        };
    }
}