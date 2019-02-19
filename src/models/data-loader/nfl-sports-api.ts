import { SportsApi } from './sports-api';
import axios from 'axios';
import { ApplicationConfig } from '../config';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';

export class NFLSportsApi extends SportsApi {
    protected sportPath = 'nfl-t1';
    protected version = '';
    private apiKey = ApplicationConfig.nflKey;

    public async getSeasonSchedule<T = NFLResponse.Season>(year: number, scheduleType: string): Promise<T> {
        const result = await axios.get<T>(`${this.baseApiUrl()}/${year}/${scheduleType}/schedule.json`, {
            params: {
                api_key: this.apiKey
            }
        });
        await this.wait(2);
        return result.data;
    }

    public async getGameStats<T = NFLResponse.GameStatistics>(gameId: string): Promise<T> {
        const result = await axios.get<T>(`${this.baseApiUrl()}/games/${gameId}/statistics.json`, {
            params: {
                api_key: this.apiKey
            }
        });
        await this.wait(2);
        return result.data;
    }

    public async getTeamRoster<T = NFLResponse.Roster>(teamId: string): Promise<T> {
        const result = await axios.get<T>(`${this.baseApiUrl()}/teams/${teamId}/roster.json`, {
            params: {
                api_key: this.apiKey
            }
        });
        await this.wait(2);
        return result.data;
    }

    public async getHierarchy<T = NFLResponse.TeamHierarchy>(): Promise<T> {
        const result = await axios.get<T>(`${this.baseApiUrl()}/teams/hierarchy.json`, {
            params: { api_key: this.apiKey }
        });
        await this.wait(2);
        return result.data;
    }

    protected includeLanguage(): boolean {
        return false;
    }
}