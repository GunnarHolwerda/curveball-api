
import * as hapi from 'hapi';
import { UserFactory } from '../../models/factories/user-factory';

export async function getUser(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];
    const user = await UserFactory.load(userId);
    const stats = await user.stats();

    return {
        user: user.toResponseObject(),
        stats
    };
}


