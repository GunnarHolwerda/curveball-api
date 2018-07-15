import * as socketio from 'socket.io';

import disconnect from '../socket-handlers/disconnect';

export abstract class BaseSocketHandler {
    private _numConnected = 0;

    public get numConnected(): number {
        return this._numConnected;
    }

    public register(socket: socketio.Socket): void {
        this._numConnected++;
        console.log('a user connected');
        socket.on('disconnect', this.disconnect.bind(this));
    }

    protected disconnect(): void {
        this._numConnected--;
        disconnect();
    }
}