import { SportsApi } from './sports-api';
import axios from 'axios';
import { ApplicationConfig } from '../config';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { NFLGame } from '../subjects/nfl-game';
import { NFLSeason } from '../subjects/nfl-season';

interface GameRetrievalConfig {
    season: number;
    type: string;
    week: number;
    awayTeam: string;
    homeTeam: string;
}

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
        const game = await SubjectFactory.loadByExternalId(gameId, SubjectType.sportGame) as NFLGame;
        if (game === null) {
            throw new Error('Attempted to retrieve status for game that does not exist');
        }
        const season = (await SubjectFactory
            .loadByExternalId(game.properties.parent_external_id, SubjectType.sportSeason))! as NFLSeason;
        const { season: seasonYear, type, week, awayTeam, homeTeam } = this.getGameRetrievalConfig(gameId, season);
        const result = await axios.get<T>(`${this.baseApiUrl()}/${seasonYear}/${type}/${week}/${awayTeam}/${homeTeam}/statistics.json`, {
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

    private getGameRetrievalConfig(gameId: string, season: NFLSeason): GameRetrievalConfig {
        const { season: seasonYear, type } = season.properties.json;
        const week = season.properties.json.weeks.find(w => w.games.find(g => g.id === gameId) !== undefined)!;
        const game = week.games.find(g => g.id === gameId)!;
        return {
            season: seasonYear,
            type,
            week: week.number,
            awayTeam: game.away,
            homeTeam: game.home
        };
    }
}