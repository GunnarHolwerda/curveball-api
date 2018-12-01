import { QTClaims } from '../types/qt';
import * as uuid from 'uuid';
import * as jwt from 'jsonwebtoken';
import { ApplicationConfig } from '../models/config';

const defaultClaims: QTClaims = {
    isLastQuestion: false,
    lifeUsed: false
};

export function createQt(quizId: string, questionId: string, claims: QTClaims = defaultClaims, userId?: string): string {
    const registeredClaims: jwt.SignOptions = {
        subject: questionId,
        issuer: quizId,
        jwtid: uuid(),
        expiresIn: '10m'
    };
    if (userId) {
        registeredClaims.audience = userId;
    }
    return jwt.sign(claims, ApplicationConfig.qtSecret, registeredClaims);
}