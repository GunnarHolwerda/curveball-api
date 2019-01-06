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

export interface League {
    id: string;
    name: string;
    alias: string;
}

export interface Conference {
    id: string;
    name: string;
    alias: string;
}

export interface Division {
    id: string;
    name: string;
    alias: string;
}

export interface Coach {
    id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    position: string;
    experience: string;
    reference: string;
}

export interface Draft {
    year: number;
    team_id: string;
    round: string;
    pick: string;
}

export interface Player {
    id: string;
    status: string;
    full_name: string;
    first_name: string;
    last_name: string;
    abbr_name: string;
    height: number;
    weight: number;
    position: string;
    primary_position: string;
    jersey_number: string;
    experience: string;
    college: string;
    birth_place: string;
    birthdate: string;
    updated: Date;
    reference: string;
    draft: Draft;
}

export interface NBARoster {
    id: string;
    name: string;
    market: string;
    alias: string;
    founded: number;
    sr_id: string;
    reference: string;
    venue: Venue;
    league: League;
    conference: Conference;
    division: Division;
    coaches: Coach[];
    players: Player[];
}
