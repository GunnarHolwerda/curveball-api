import * as Randomstring from 'randomstring';

import { Test as BaseTest } from './test-resources';
import { IUserResponse, DevVerificationCode } from '../../../src/handlers/quiz/models/user';


export namespace Test {

    export interface TokenResponse {
        token: string;
    }

    export interface UserResponse {
        user: IUserResponse;
    }

    export interface UserPayload {
        phone: string;
        referrer?: string;
    }

    export interface StatsPayload {
        stats: {
            winnings: string;
            wins: number;
        };
    }

    export type UserTokenResponse = UserResponse & TokenResponse;

    export function generatePhone(): string {
        const getDigit = () => Math.round(Math.random() * 9);
        // tslint:disable-next-line
        const phone = `${getDigit()}${getDigit()}${getDigit()}-${getDigit()}${getDigit()}${getDigit()}-${getDigit()}${getDigit()}${getDigit()}${getDigit()}`;
        return phone;
    }

    export class UserResources extends BaseTest.ApiResources {
        constructor(token?: string) {
            super(token);
        }

        public async rawCreateUser(phone: string, referral?: string): Promise<{ userId: string }> {
            return this.post<{ userId: string }>('/users', { phone, referral });
        }

        public async createUser(phone: string = generatePhone(), referral?: string): Promise<{ userId: string }> {
            return this.rawCreateUser(phone, referral);
        }

        public async verifyUser(
            userId: string,
            code: string = DevVerificationCode,
            username: string = Randomstring.generate(15)): Promise<UserTokenResponse> {
            return this.post<UserTokenResponse>(`/users/${userId}/verify`, { code, username });
        }

        public async getNewUser(referrer?: string): Promise<UserTokenResponse> {
            const { userId } = await this.createUser(Test.generatePhone(), referrer);
            return this.verifyUser(userId);
        }

        public async getUser(userId: string): Promise<UserResponse & StatsPayload> {
            return this.get<UserResponse & StatsPayload>(`/users/${userId}`);
        }

        public async updateUser(userId: string, properties: Partial<IUserResponse>): Promise<UserResponse> {
            return this.put<UserResponse>(`/users/${userId}`, properties);
        }

        public async getLives(userId: string): Promise<number> {
            return (await this.get<{ lives: number }>(`/users/${userId}/lives`)).lives;
        }

        public async useLife(userId: string, qt: string): Promise<{ token: string }> {
            const config = { ...this.config! };
            config.headers.QT = `Bearer ${qt}`;
            return this.post<{ token: string }>(`/users/${userId}/lives/use`, undefined, config);
        }

        public async forceLogin(phone: string): Promise<UserTokenResponse> {
            return this.makeInternalRequest(() => this.post<UserTokenResponse>(`/users_force_login`, { phone }, this.config));
        }
    }
}
