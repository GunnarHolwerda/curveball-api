
import * as hapi from 'hapi';

export async function postUserFriendsInvite(event: hapi.Request): Promise<object> {
    console.log(event);
    return {
        message: 'ok'
    };
}


