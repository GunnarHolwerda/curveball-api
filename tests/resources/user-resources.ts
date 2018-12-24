import * as Randomstring from 'randomstring';
import { IUserResponse, DevVerificationCode } from '../../src/models/entities/user';
import { ApiResources } from './test-resources';
import { generatePhone } from '../../src/util/generate-phone';
import { IFriendResponse } from '../../src/models/entities/friend';


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

export interface UpdateUserPayload {
    name?: string;
    username?: string;
    photo?: string;
}

export interface GetFriendsResponse {
    requests: {
        outgoing: Array<IFriendResponse>;
        incoming: Array<IFriendResponse>;
    };
    friends: Array<IFriendResponse>;
}

export type UserTokenResponse = UserResponse & TokenResponse & StatsPayload;

export class UserResources extends ApiResources {
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
        options: { username: string; name?: string } = { username: Randomstring.generate(15) }): Promise<UserTokenResponse> {
        return this.post<UserTokenResponse>(`/users/${userId}/verify`, { code, ...options });
    }

    public async getNewUser(referrer?: string): Promise<UserTokenResponse> {
        const { userId } = await this.createUser(generatePhone(), referrer);
        return this.verifyUser(userId);
    }

    public async getUser(userId: string): Promise<UserResponse & StatsPayload> {
        return this.get<UserResponse & StatsPayload>(`/users/${userId}`);
    }

    public async updateUser(userId: string, properties: UpdateUserPayload): Promise<UserResponse> {
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

    public async addFriend(userId: string, friendUserId: string): Promise<{ friend: IFriendResponse }> {
        return this.post<{ friend: IFriendResponse }>(`/users/${userId}/friends/${friendUserId}`);
    }

    public async getFriends(userId: string): Promise<GetFriendsResponse> {
        return this.get<GetFriendsResponse>(`/users/${userId}/friends`);
    }

    public async removeFriend(userId: string, friendUserId: string): Promise<void> {
        return this.delete(`/users/${userId}/friends/${friendUserId}`);
    }
}
