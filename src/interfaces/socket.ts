import * as socketio from 'socket.io';

export interface UserProperties {
    userId: string;
}

export interface Socket extends socketio.Socket {
    user: UserProperties;
}