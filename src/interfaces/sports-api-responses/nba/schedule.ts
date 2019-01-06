export interface League {
    id: string;
    name: string;
    alias: string;
}

export interface Season {
    id: string;
    year: number;
    type: string;
}

export interface Venue {
    id: string;
    name: string;
    capacity: number;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface Home {
    name: string;
    alias: string;
    id: string;
    sr_id: string;
    reference: string;
}

export interface Away {
    name: string;
    alias: string;
    id: string;
    sr_id: string;
    reference: string;
}

export interface Game {
    id: string;
    status: string;
    coverage: string;
    scheduled: Date;
    track_on_court: boolean;
    reference: string;
    venue: Venue;
    home: Home;
    away: Away;
}

export interface NBASchedule {
    league: League;
    season: Season;
    games: Game[];
}

