import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';
import { ApplicationConfig } from './config';
import { UserJwtClaims } from '../interfaces/user-jwt-claims';
import { AccountJwtClaims } from '../interfaces/account-jwt-claims';

export function createUserJWT(claims: UserJwtClaims): string {
    return jwt.sign(claims, ApplicationConfig.jwtSecret, { jwtid: uuid() });
}

export function createAccountJWT(claims: AccountJwtClaims): string {
    return jwt.sign(claims, ApplicationConfig.accountSecret, { jwtid: uuid() });
}