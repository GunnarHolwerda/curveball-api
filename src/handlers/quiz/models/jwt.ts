import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';
import { ApplicationConfig } from '../../../config';

function getUserSecret(): string {
    return ApplicationConfig.jwtSecret;
}

export function createUserJWT(claims: any): string {
    return jwt.sign(claims, getUserSecret(), { jwtid: uuid() });
}