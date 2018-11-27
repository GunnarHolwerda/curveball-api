import * as Joi from 'joi';
import * as Boom from 'boom';

import * as hapi from 'hapi';
import { IUser } from '../../models/user';
import { UserFactory } from '../../models/factories/user-factory';

export const putUserSchema = Joi.object().keys({
    name: Joi.string().optional(),
    username: Joi.string().optional(),
    phone: Joi.string().optional(),
    photo: Joi.string().optional()
});

export async function putUser(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];
    const userParams = event.payload as IUser;
    const user = await UserFactory.load(userId);

    if (user === null) {
        throw Boom.notFound();
    }

    for (const property in userParams) {
        if (userParams.hasOwnProperty(property)) {
            user.properties[property] = userParams[property];
        }
    }

    try {
        await user.save();
    } catch (e) {
        if (e.code === '23505') {
            throw Boom.conflict();
        }
        throw Boom.internal();
    }

    return {
        user: user.toResponseObject()
    };
}


