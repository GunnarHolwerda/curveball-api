import { RouteOptionsPreObject, Request, ResponseToolkit } from 'hapi';
import * as Boom from 'boom';
import * as jwt from 'jsonwebtoken';
import { ApplicationConfig } from '../../models/config';
import { AllQtClaims } from '../../types/qt';

export const getQtTokenFromHeader = (req: Request): string | false => {
    const header = req.headers['QT'] || req.headers['qt'];
    if (header === undefined) {
        return false;
    }
    if (!header.startsWith('Bearer ')) {
        return false;
    }
    return header.replace('Bearer ', '');
};

export const extractQtClaims: RouteOptionsPreObject = {
    method: async (request: Request, _: ResponseToolkit): Promise<any> => {
        const token = getQtTokenFromHeader(request);
        if (!token) {
            throw Boom.forbidden();
        }

        try {
            const verifiedToken: AllQtClaims = jwt.verify(token, ApplicationConfig.qtSecret) as AllQtClaims;
            return verifiedToken;
        } catch (e) {
            console.error(e);
            throw Boom.unauthorized();
        }
    },
    assign: 'qtClaims',

};
