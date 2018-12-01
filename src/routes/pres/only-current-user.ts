import { RouteOptionsPreObject, Request, ResponseToolkit } from 'hapi';
import * as Boom from 'boom';
import { UserJwtClaims } from '../../interfaces/user-jwt-claims';

export const onlyCurrentUser: RouteOptionsPreObject = {
    method: async (request: Request, _: ResponseToolkit): Promise<any> => {
        const { userId: authorizedUserId } = request.auth.credentials as UserJwtClaims;
        const { userId: userIdFromPath } = request.params;

        if (authorizedUserId !== userIdFromPath) {
            throw Boom.forbidden();
        }
        return true;
    },
    assign: 'authorized',

};
