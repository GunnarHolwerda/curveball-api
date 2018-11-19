import * as jwt from 'jsonwebtoken';

import { CurveballLambda, UserJwtClaims } from '../../lambda/lambda';
import { CurveballUnauthorized, CurveballForbidden } from '../../models/curveball-error';
import { String } from 'aws-sdk/clients/lexruntime';
export interface Claims {
    userClaims: UserJwtClaims;
    quizClaims: CurveballLambda.AllQtClaims;
}

export function verifyQt(token: String, quizId: string, questionId: string, userClaims: UserJwtClaims, auth: boolean): Claims {
    try {
        const secret = process.env.QT_SECRET!;

        const claimsToVerify = { issuer: quizId };

        if (auth) {
            claimsToVerify['subject'] = questionId;
        }

        const verifiedToken: CurveballLambda.AllQtClaims = jwt.verify(token, secret, claimsToVerify) as CurveballLambda.AllQtClaims;
        if (verifiedToken.aud && verifiedToken.aud !== userClaims.userId) {
            throw new CurveballUnauthorized('Invalid user');
        }
        return { userClaims: userClaims, quizClaims: verifiedToken };
    } catch (e) {
        throw new CurveballForbidden('Invalid QT');
    }
}