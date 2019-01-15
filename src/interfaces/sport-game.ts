export interface SportGame {
    isFinished(): boolean;
    updateStatistics(): Promise<void>;
}