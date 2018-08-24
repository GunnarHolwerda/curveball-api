import { Socket } from '../interfaces/socket';

export abstract class BaseSocketHandler {

    public register(socket: Socket): void {
        const heartbeat = setInterval(() => {
            socket.emit('heartbeat');
        }, 1000);
        console.log(`User, ${socket.user.userId}, connected to ${this.cachePrefix}`, Date.now());
        socket.on('disconnect', () => this.disconnect(heartbeat));
        socket.on('disconnecting', (reason) => {
            console.log(`Disconnecting user ${socket.user.userId} from ${this.cachePrefix}:`, reason);
        });
        socket.on('error', (err) => {
            console.log(`An error occured in ${this.cachePrefix}:`, err);
        });
    }

    public async destroy(): Promise<any> { }

    protected async disconnect(heartbeat: NodeJS.Timer): Promise<void> {
        console.table(`User disconnected from ${this.cachePrefix}`);
        clearInterval(heartbeat);
    }

    protected abstract get cachePrefix(): string;
}