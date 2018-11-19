import { QueryResult } from 'pg';
import * as Randomstring from 'randomstring';

import { Postgres } from '../postgres';
import { createUserJWT } from './jwt';
import { Life } from './lives';
import { UserJwtClaims } from '../lambda/lambda';
import { Database } from './database';
import { UserFactory } from './factories/user-factory';
import { LivesFactory } from './factories/lives-factory';
import { omit } from '../util/omit';

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

export class User {
    public properties: IUser;

    constructor(private _user: IUser) {
        this.properties = { ...this._user };
    }

    public static async create(phoneNumber: string): Promise<User> {
        let result: QueryResult;
        result = await Database.instance.client.query(`
            INSERT INTO ${USER_TABLE_NAME} (phone, photo)
            VALUES ($1, $2)
            RETURNING user_id;
        `, [phoneNumber, getAvatarUrl()]);
        const userId = result!.rows[0].user_id;
        return UserFactory.load(userId);
    }

    public getJWTToken(): string {
        const claims: Partial<UserJwtClaims> = { userId: this.properties.user_id! };
        return createUserJWT(claims);
    }

    public async save(): Promise<void> {
        if (this.properties.photo === '') {
            this.properties.photo = getAvatarUrl();
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
    }

    public async lives(): Promise<Array<Life>> {
        return await LivesFactory.loadAvailableForUser(this.properties.user_id);
    }

    public async stats(): Promise<{ wins: number, winnings: string }> {
        let result = await Database.instance.client.query(`
            SELECT SUM(amount_won) as winnings, COUNT(*) as wins
            FROM winners WHERE user_id = $1;
        `, [this.properties.user_id]);

        result = result.rows[0];

        return {
            wins: result['wins'],
            winnings: result['winnings'] ? Number.parseFloat(result['winnings']).toFixed(2) : '0'
        };
    }

    public toResponseObject(): Partial<IUser> {
        const response = {
            ...(omit(this.properties, ['password', 'phone']))
        };
        return response as Partial<IUser>;
    }
}