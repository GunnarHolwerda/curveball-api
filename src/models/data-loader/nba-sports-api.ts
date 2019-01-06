import { SportsApi } from './sports-api';
import axios from 'axios';
import { NBASchedule } from '../../interfaces/sports-api-responses/nba/schedule';
import { NBAStatistics } from '../../interfaces/sports-api-responses/nba/statistics';
import { NBARoster } from '../../interfaces/sports-api-responses/nba/roster';
import { ApplicationConfig } from '../config';

export class NBASportsApi extends SportsApi {
    protected sportPath = 'nba';
    private apiKey = ApplicationConfig.nbaKey;

    public async getSchedule(): Promise<NBASchedule> {
        const result = await axios.get<NBASchedule>(this.baseApiUrl() + '/games/2017/SIM/schedule.json', {
            params: {
                api_key: this.apiKey
            }
        });
        return result.data;
    }

    public async getGameStats(gameId: string): Promise<NBAStatistics> {
        const result = await axios.get<NBAStatistics>(this.baseApiUrl() + `/games/${gameId}/summary.json`, {
            params: {
                api_key: this.apiKey
            }
        });
        return result.data;
    }

    public async getTeamRoster(teamId: string): Promise<NBARoster> {
        const result = await axios.get<NBARoster>(this.baseApiUrl() + `/teams/${teamId}/profile.json`, {
            params: {
                api_key: this.apiKey
            }
        });
        return result.data;
    }
}