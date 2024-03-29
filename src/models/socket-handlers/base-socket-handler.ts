import { Socket } from '../../interfaces/socket';
import { QuizEvents } from '../../types/events';

export abstract class BaseSocketHandler {
    public register(socket: Socket): void {
        console.log(`User, ${socket.user.userId}, connected to ${this.cachePrefix}`, Date.now());
        socket.on('disconnect', () => this.disconnect(socket));
        socket.on('disconnecting', (reason) => {
            console.log(`Disconnecting user ${socket.user.userId} from ${this.cachePrefix}:`, reason);
        });
        socket.on('error', (err) => {
            console.log(`An error occured in ${this.cachePrefix}:`, err);
        });
    }

    public async destroy(): Promise<any> { }

    protected async disconnect(socket: Socket): Promise<void> {
        console.log(`User disconnected from ${this.cachePrefix}`);
        socket.broadcast.emit(QuizEvents.userDisconnected);
    }

    protected abstract get cachePrefix(): string;
}