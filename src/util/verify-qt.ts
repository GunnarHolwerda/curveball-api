import * as jwt from 'jsonwebtoken';
import * as Boom from 'boom';
import { UserJwtClaims } from '../interfaces/user-jwt-claims';
import { AllQtClaims } from '../types/qt';
import { ApplicationConfig } from '../models/config';

export function verifyQt(token: string, quizId: string, questionId: string, userClaims: UserJwtClaims, auth: boolean): AllQtClaims {
    try {
        const secret = ApplicationConfig.qtSecret;

        const claimsToVerify = { issuer: quizId };

        if (auth) {
            claimsToVerify['subject'] = questionId;
        }

        const verifiedToken: AllQtClaims = jwt.verify(token, secret, claimsToVerify) as AllQtClaims;
        if (verifiedToken.aud && verifiedToken.aud !== userClaims.userId) {
            throw Boom.unauthorized('Invalid user');
        }
        return verifiedToken;
    } catch (e) {
        throw Boom.forbidden('Invalid QT');
    }
}