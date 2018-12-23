
import * as hapi from 'hapi';

export async function postUserFriendsInvite(event: hapi.Request): Promise<object> {
    console.log(event);
    // TODO: Endpoint that takes a phone number and creates friend invite record
    // TODO: On user register if pending friend invites, accept all invites and auto add those friends
    return {
        message: 'ok'
    };
}


