import * as Hapi from 'hapi';
import * as socketio from 'socket.io';

const server = new Hapi.Server({
    port: 3001
});

server.route({
    path: '/',
    method: 'GET',
    handler: () => {
        return 'Hello World!';
    }
});

async function start() {
    try {
        const io = socketio(server.listener);
        io.on('connection', function (socket) {
            socket.emit('Oh hii!');
            socket.on('burp', function () {
                socket.emit('Excuse you!');
            });
            socket.on('disconnect', function () {
                console.log('user left me!');
            });
        });
        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();