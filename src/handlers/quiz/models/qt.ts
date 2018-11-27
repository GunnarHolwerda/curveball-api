import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

function getQTSecret(): string {
    return process.env.QT_SECRET!;
}

export interface BaseClaims {
    aud: string; // userId
    sub: string; // questionId
    iss: string; // quizId
    jti: string;
    exp: number;
}

export interface QTClaims {
    isLastQuestion: boolean;
    lifeUsed: boolean;
}

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
    return jwt.sign(claims, getQTSecret(), registeredClaims);
}