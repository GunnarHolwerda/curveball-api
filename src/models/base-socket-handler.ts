import { Socket } from '../interfaces/socket';
import { QuizEvents } from '../events';

export abstract class BaseSocketHandler {
    public register(socket: Socket): void {
        console.log(`User, ${socket.user.userId}, connected to ${this.cachePrefix}`, Date.now());
        socket.on('disconnect', () => this.disconnect(socket));
    }

    public async destroy(): Promise<any> { }

    protected async disconnect(socket: Socket): Promise<void> {
        console.table(`User disconnected from ${this.cachePrefix}`);
        socket.broadcast.emit(QuizEvents.userDisconnected);
    }

    protected abstract get cachePrefix(): string;
}