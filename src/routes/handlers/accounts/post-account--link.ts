import * as Joi from 'joi';
import * as hapi from 'hapi';
import * as jwt from 'jsonwebtoken';
import { ApplicationConfig } from '../../../models/config';
import { AccountFactory } from '../../../models/factories/account-factory';
import { UserJwtClaims } from '../../../interfaces/user-jwt-claims';
import { AccountJwtClaims } from '../../../interfaces/account-jwt-claims';
import { UserFactory } from '../../../models/factories/user-factory';

export const postAccountLinkSchema = Joi.object().keys({
    accountToken: Joi.string().required().description('The JWT authorizing the account to link to'),
    userToken: Joi.string().required().description('The JWT authorizing the user to link to')
}).unknown(false);

export async function postAccountLink(event: hapi.Request): Promise<object> {
    const { accountToken, userToken } = event.payload as { accountToken: string, userToken: string };
    const { accountId } = jwt.verify(accountToken, ApplicationConfig.accountSecret) as AccountJwtClaims;
    const { userId } = jwt.verify(userToken, ApplicationConfig.jwtSecret) as UserJwtClaims;

    const account = await AccountFactory.load(accountId);
    if (!(await account!.linkedUserId())) {
        await account!.linkUser(userId);
    }

    const user = await UserFactory.load(userId);
    return {
        user: user!.toResponseObject()
    };
}


