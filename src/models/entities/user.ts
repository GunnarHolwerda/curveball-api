import * as Randomstring from 'randomstring';
import { createUserJWT } from '../jwt';
import { Powerup } from './powerup';
import { Database } from '../database';
import { UserFactory } from '../factories/user-factory';
import { PowerupFactory } from '../factories/lives-factory';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { UserJwtClaims } from '../../interfaces/user-jwt-claims';
import { PhoneVerifier } from '../phone-verifier';
import { Analytics } from '../analytics';
import { omit } from '../../util/omit';
import { camelizeKeys } from '../../util/camelize-keys';
import { WINNER_TABLE_NAME } from '../../models/entities/winner';

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
        const sq = Database.instance.sq;
        const result = await sq.from(USER_TABLE_NAME).insert({ phone: phoneNumber, photo: getAvatarUrl() }).return`user_id`;
        const userId = result[0].user_id;
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

        const sq = Database.instance.sq;
        await sq.from(USER_TABLE_NAME).set({ ...omit(this.properties, ['user_id']) }).where`user_id = ${this._user.user_id}`;
        Analytics.instance.trackUser(this);
    }

    public async lives(): Promise<Array<Powerup>> {
        return await PowerupFactory.loadAvailableForUser(this.properties.user_id);
    }

    public async stats(): Promise<{ wins: number, winnings: string }> {
        const sq = Database.instance.sq;
        const queryResult = await sq.from(WINNER_TABLE_NAME)
            .where`user_id = ${this.properties.user_id}`
            .return({ winnings: 'SUM(amount_won)', wins: 'COUNT(*)' });

        const result = queryResult[0];

        return {
            wins: Number.parseInt(result['wins'], 10),
            winnings: result['winnings'] ? Number.parseFloat(result['winnings']).toFixed(2) : '0'
        };
    }

    public toResponseObject(): IUserResponse {
        const response = {
            ...(omit(this.properties, ['password', 'phone']))
        };
        return camelizeKeys(response) as IUserResponse;
    }

    public analyticsProperties(): AnalyticsProperties {
        const {
            name,
            username,
            created,
            user_id
        } = this.properties;
        return { name, username, created, userId: user_id };
    }
}