import * as Joi from 'joi';

import * as hapi from 'hapi';
import { IUser } from '../../models/user';
import { UserFactory } from '../../models/factories/user-factory';

export const putUserSchema = Joi.object().keys({
    name: Joi.string().optional(),
    username: Joi.string().optional(),
    phone: Joi.string().regex(/\d{3}-\d{3}-\d{4}/).optional(),
    photo: Joi.string().optional()
});

export async function putUser(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];
    const userParams = event.payload as IUser;
    const user = await UserFactory.load(userId);

    for (const property in userParams) {
        if (userParams.hasOwnProperty(property)) {
            user.properties[property] = userParams[property];
        }
    }
    await user.save();

    return {
        user: user.toResponseObject()
    };
}

