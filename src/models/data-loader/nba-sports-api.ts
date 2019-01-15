import { SportsApi } from './sports-api';
import axios from 'axios';
import { ApplicationConfig } from '../config';
import { NBAResponse } from '../../interfaces/sports-api-responses/nba';

export class NBASportsApi extends SportsApi {
    protected sportPath = 'nba';
    protected version = 'v5';
    private apiKey = ApplicationConfig.nbaKey;

    public async getSeasonSchedule<T = NBAResponse.SeasonSchedule>(): Promise<T> {
        try {
            const result = await axios.get<T>(this.baseApiUrl() + '/games/2017/REG/schedule.json', {
                params: {
                    api_key: this.apiKey
                }
            });
            await this.wait(2);
            return result.data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    public async getGameStats<T = NBAResponse.GameStatistics>(gameId: string): Promise<T> {
        try {
            const result = await axios.get<T>(this.baseApiUrl() + `/games/${gameId}/summary.json`, {
                params: {
                    api_key: this.apiKey
                }
            });
            await this.wait(2);
            return result.data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    public async getTeamRoster<T = NBAResponse.Roster>(teamId: string): Promise<T> {
        try {
            const result = await axios.get<T>(this.baseApiUrl() + `/teams/${teamId}/profile.json`, {
                params: {
                    api_key: this.apiKey
                }
            });
            await this.wait(2);
            return result.data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}