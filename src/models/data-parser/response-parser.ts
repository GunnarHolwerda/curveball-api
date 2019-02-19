export abstract class ResponseParser<T> {

    constructor(protected response: T) { }

    public abstract seasonId(): string;
    public abstract getTeams(hierarcy: any): Array<any>;
    public abstract getGames(): Array<any>;
    public abstract getPlayers(roster: any): Array<any>;
}