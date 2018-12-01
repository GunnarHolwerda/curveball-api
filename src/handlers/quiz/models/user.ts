import { QueryResult } from 'pg';
import * as Randomstring from 'randomstring';
import { Postgres } from '../postgres';
import { createUserJWT } from './jwt';
import { Powerup } from './powerup';
import { UserJwtClaims } from '../lambda/lambda';
import { Database } from './database';
import { UserFactory } from './factories/user-factory';
import { PowerupFactory } from './factories/lives-factory';
import { omit } from '../util/omit';
import { camelizeKeys } from '../util/camelize-keys';
import { PhoneVerifier } from '../../../handlers/quiz/models/phone-verifier';
import { Analytics } from '../../../models/analytics';
import { Analyticize, AnalyticsProperties } from '../interfaces/analyticize';

export interface IUser {
    user_id: string;
    username: string;
    name: string;
    phone: string;
    photo: string;
    last_accessed: string;
    created: string;
}

export interface IUserResponse {
    userId: string;
    username: string;
    name: string;
    phone: string;
    photo: string;
    lastAccessed: string;
    created: string;
}

export const USER_TABLE_NAME = 'users';

const getAvatarUrl = (): string => {
    const randString = Randomstring.generate(15);
    return `https://www.tinygraphs.com/spaceinvaders/${randString}?theme=duskfalling&numcolors=4&size=220&fmt=svg`;
};

export const DevVerificationCode = '0000000';

export class User implements Analyticize {
    public properties: IUser;

    constructor(private _user: IUser) {
        this.properties = { ...this._user };
    }

    public static async create(phoneNumber: string): Promise<User> {
        const formattedPhoneNumber = PhoneVerifier.getValidPhoneNumber(phoneNumber);
        if (formattedPhoneNumber === null) {
            throw new Error('Invalid phone number');
        }
        let result: QueryResult;
        result = await Database.instance.client.query(`
            INSERT INTO ${USER_TABLE_NAME} (phone, photo)
            VALUES ($1, $2)
            RETURNING user_id;
        `, [formattedPhoneNumber, getAvatarUrl()]);
        const userId = result!.rows[0].user_id;
        const user = (await UserFactory.load(userId))!;
        Analytics.instance.trackUser(user);
        return user;
    }

    public getJWTToken(): string {
        const claims: Partial<UserJwtClaims> = { userId: this.properties.user_id! };
        return createUserJWT(claims);
    }

    public async save(): Promise<void> {
        if (this.properties.photo === '') {
            this.properties.photo = getAvatarUrl();
        }
        if (PhoneVerifier.getValidPhoneNumber(this.properties.phone) === null) {
            throw new Error('Invalid phone number');
        }

        const updateString: string = Postgres.buildUpatePropertyString(this._user, this.properties);
        if (updateString) {
            await Database.instance.client.query(`
                UPDATE ${USER_TABLE_NAME}
                SET
                    ${updateString}
                WHERE user_id = $1;
            `, [this._user.user_id]);
        }
        Analytics.instance.trackUser(this);
    }

    public async lives(): Promise<Array<Powerup>> {
        return await PowerupFactory.loadAvailableForUser(this.properties.user_id);
    }

    public async stats(): Promise<{ wins: number, winnings: string }> {
        let result = await Database.instance.client.query(`
            SELECT SUM(amount_won) as winnings, COUNT(*) as wins
            FROM winners WHERE user_id = $1;
        `, [this.properties.user_id]);

        result = result.rows[0];

        return {
            wins: Number.parseInt(result['wins'], 10),
            winnings: result['winnings'] ? Number.parseFloat(result['winnings']).toFixed(2) : '0'
        };
    }

    public toResponseObject(): Partial<IUser> {
        const response = {
            ...(omit(this.properties, ['password', 'phone']))
        };
        return camelizeKeys(response) as Partial<IUser>;
    }

    public analyticsProperties(): AnalyticsProperties {
        const {
            name,
            username,
            created
        } = this.properties;
        return { name, username, created };
    }
}