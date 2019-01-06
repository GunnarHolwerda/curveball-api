export interface Reference {
    id: string;
    origin: string;
}

export interface Franchise {
    id: string;
    name: string;
    alias: string;
    references: Reference[];
}

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

export interface Division {
    id: string;
    name: string;
    alias: string;
}

export interface Conference {
    id: string;
    name: string;
    alias: string;
}

export interface Reference2 {
    id: string;
    origin: string;
}

export interface Coach {
    id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    position: string;
}

export interface Team {
    id: string;
    name: string;
    market: string;
    alias: string;
    sr_id: string;
}

export interface Draft {
    year: number;
    round: number;
    number: number;
    team: Team;
}

export interface Reference3 {
    id: string;
    origin: string;
}

export interface Player {
    id: string;
    name: string;
    jersey: string;
    last_name: string;
    first_name: string;
    abbr_name: string;
    preferred_name: string;
    birth_date: string;
    weight: number;
    height: number;
    position: string;
    birth_place: string;
    high_school: string;
    college: string;
    college_conf: string;
    rookie_year: number;
    status: string;
    draft: Draft;
    references: Reference3[];
}

export interface NFLRoster {
    id: string;
    name: string;
    market: string;
    alias: string;
    sr_id: string;
    franchise: Franchise;
    venue: Venue;
    division: Division;
    conference: Conference;
    references: Reference2[];
    coaches: Coach[];
    players: Player[];
    _comment: string;
}
