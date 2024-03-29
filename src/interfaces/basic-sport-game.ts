export interface BasicSportGame {
    getHomeTeam(): { id: string, points: number };
    getAwayTeam(): { id: string, points: number };
    isFinished(): boolean;
    updateStatistics(): Promise<void>;
}