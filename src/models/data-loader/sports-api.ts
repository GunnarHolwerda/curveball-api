import { Environment } from '../../types/environments';
import { ApplicationConfig } from '../config';

export enum Sport {
    NFL = 'nfl',
    NBA = 'nba',
    NCAAM = 'ncaam',
    NCAAF = 'ncaaf'
}

export abstract class SportsApi {
    private baseUrl = 'https://api.sportradar.us';
    protected abstract sportPath: string;
    protected abstract version: string;

    public wait(seconds: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, seconds * 1000);
        });
    }

    public abstract getSeasonSchedule<T>(): Promise<T>;
    public abstract getGameStats<T>(gameId: string): Promise<T>;
    public abstract getTeamRoster<T>(teamId: string): Promise<T>;

    protected baseApiUrl(): string {
        let accessLevel = 'trial';
        if (ApplicationConfig.nodeEnv === Environment.local) {
            accessLevel = 'simulation';
        }

        return `${this.baseUrl}/${this.sportPath}/${accessLevel}/${this.version}/en`;
    }
}