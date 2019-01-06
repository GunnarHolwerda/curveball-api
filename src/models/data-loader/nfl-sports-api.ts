import { SportsApi } from './sports-api';
import axios from 'axios';
import { NflGameSchedule } from '../../interfaces/sports-api-responses/nfl/schedule';
import { NflGameStatistics } from '../../interfaces/sports-api-responses/nfl/statistics';
import { NFLRoster } from '../../interfaces/sports-api-responses/nfl/roster';
import { ApplicationConfig } from '../config';

export class NFLSportsApi extends SportsApi {
    protected sportPath = 'nfl/official';
    private apiKey = ApplicationConfig.nflKey;

    public async getSchedule(): Promise<NflGameSchedule> {
        const result = await axios.get<NflGameSchedule>(this.baseApiUrl() + '/games/2017/PST/1/schedule.json', {
            params: {
                api_key: this.apiKey
            }
        });
        return result.data;
    }

    public async getGameStats(gameId: string): Promise<NflGameStatistics> {
        const result = await axios.get<NflGameStatistics>(this.baseApiUrl() + `/games/${gameId}/statistics.json`, {
            params: {
                api_key: this.apiKey
            }
        });
        return result.data;
    }

    public async getTeamRoster(teamId: string): Promise<NFLRoster> {
        const result = await axios.get<NFLRoster>(this.baseApiUrl() + `/teams/${teamId}/full_roster.json`, {
            params: {
                api_key: this.apiKey
            }
        });
        return result.data;
    }
}