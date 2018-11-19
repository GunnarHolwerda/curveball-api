import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

function getUserSecret(): string {
    return process.env.USER_TOKEN_SECRET!;
}

export function createUserJWT(claims: any): string {
    return jwt.sign(claims, getUserSecret(), { jwtid: uuid() });
}