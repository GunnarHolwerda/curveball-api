export interface Venue {
    id: string;
    name: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    address: string;
    capacity: number;
    surface: string;
    roof_type: string;
}

export interface Home {
    id: string;
    name: string;
    alias: string;
    sr_id: string;
}

export interface Away {
    id: string;
    name: string;
    alias: string;
    sr_id: string;
}

export interface Broadcast {
    network: string;
    satellite: string;
    internet: string;
}

export interface Period {
    period_type: string;
    id: string;
    number: number;
    sequence: number;
    home_points: number;
    away_points: number;
}

export interface Scoring {
    home_points: number;
    away_points: number;
    periods: Period[];
}

export interface Game {
    id: string;
    status: string;
    reference: string;
    number: number;
    scheduled: Date;
    attendance: number;
    utc_offset: number;
    entry_mode: string;
    weather: string;
    venue: Venue;
    home: Home;
    away: Away;
    broadcast: Broadcast;
    scoring: Scoring;
}

export interface Week {
    id: string;
    sequence: number;
    title: string;
    games: Game[];
}

export interface NflGameSchedule {
    id: string;
    year: number;
    type: string;
    name: string;
    week: Week;
    _comment: string;
}
