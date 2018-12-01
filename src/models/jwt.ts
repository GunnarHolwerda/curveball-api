import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';
import { ApplicationConfig } from './config';

export function createUserJWT(claims: any): string {
    return jwt.sign(claims, ApplicationConfig.jwtSecret, { jwtid: uuid() });
}