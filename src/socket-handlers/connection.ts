import * as socketio from 'socket.io';

export default function connection(socket: socketio.Socket) {
    console.log('a user connected');
    socket.emit('Oh hii!');
}