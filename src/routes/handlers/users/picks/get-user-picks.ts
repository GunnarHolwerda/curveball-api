
import * as hapi from 'hapi';
import * as Boom from 'boom';
import { UserFactory } from '../../../../models/factories/user-factory';

export async function getUserPicks(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];
    const user = await UserFactory.load(userId);
    if (user === null) {
        throw Boom.notFound();
    }

    return {
        user: user.toResponseObject(),
    };
}


