import { Environment } from '../../types/environments';
import { ApplicationConfig } from '../config';

export enum Sport {
    NFL,
    NBA,
    NCAAM,
    NCAAF
}

export abstract class SportsApi {
    private baseUrl = 'https://api.sportradar.us';
    protected abstract sportPath: string;

    public abstract getSchedule(): Promise<any>;
    public abstract getGameStats(gameId: string): Promise<any>;
    public abstract getTeamRoster(teamId: string): Promise<any>;

    protected baseApiUrl(): string {
        let accessLevel = 'trial';
        if (ApplicationConfig.nodeEnv === Environment.local) {
            accessLevel = 'simulation';
        }

        return `${this.baseUrl}/${this.sportPath}/${accessLevel}`;
    }
}