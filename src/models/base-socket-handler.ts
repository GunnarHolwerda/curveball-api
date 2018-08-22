import { Socket } from '../interfaces/socket';

export abstract class BaseSocketHandler {
    public register(socket: Socket): void {
        console.log(`User, ${socket.user.userId}, connected to ${this.cachePrefix}`);
        socket.on('disconnect', this.disconnect.bind(this));
    }

    public async destroy(): Promise<any> { }

    protected async disconnect(): Promise<void> {
        console.table(`User disconnected from ${this.cachePrefix}`);
    }

    protected abstract get cachePrefix(): string;
}