export namespace NBAResponse {
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

    export interface PlayerDetail {
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

    export interface Roster {
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
        players: PlayerDetail[];
    }
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

    export interface Team {
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
        home_points: number;
        away_points: number;
        track_on_court: boolean;
        reference: string;
        venue: Venue;
        home: Team;
        away: Team;
    }

    export interface SeasonSchedule {
        league: League;
        season: Season;
        games: Game[];
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

    export interface Scoring {
        type: string;
        number: number;
        sequence: number;
        points: number;
    }

    export interface MostUnanswered {
        points: number;
        own_score: number;
        opp_score: number;
    }

    export interface Period {
        type: string;
        id: string;
        number: number;
        sequence: number;
        minutes: string;
        field_goals_made: number;
        field_goals_att: number;
        field_goals_pct: number;
        three_points_made: number;
        three_points_att: number;
        three_points_pct: number;
        two_points_made: number;
        two_points_att: number;
        two_points_pct: number;
        blocked_att: number;
        free_throws_made: number;
        free_throws_att: number;
        free_throws_pct: number;
        offensive_rebounds: number;
        defensive_rebounds: number;
        rebounds: number;
        assists: number;
        turnovers: number;
        steals: number;
        blocks: number;
        assists_turnover_ratio: number;
        personal_fouls: number;
        offensive_fouls: number;
        points: number;
        fast_break_pts: number;
        second_chance_pts: number;
        team_turnovers: number;
        points_off_turnovers: number;
        team_rebounds: number;
        flagrant_fouls: number;
        player_tech_fouls: number;
        team_tech_fouls: number;
        coach_tech_fouls: number;
        pls_min: number;
        effective_fg_pct: number;
        bench_points: number;
        points_in_paint: number;
        points_in_paint_att: number;
        points_in_paint_made: number;
        points_in_paint_pct: number;
        true_shooting_att: number;
        true_shooting_pct: number;
        biggest_lead: number;
        fouls_drawn: number;
        efficiency: number;
        efficiency_game_score: number;
        defensive_rating: number;
        offensive_rating: number;
        points_against: number;
        possessions: number;
        opponent_possessions: number;
        team_defensive_rebounds: number;
        team_offensive_rebounds: number;
        time_leading: string;
        defensive_points_per_possession: number;
        offensive_points_per_possession: number;
        team_fouls: number;
        total_rebounds: number;
        total_fouls: number;
        second_chance_att: number;
        second_chance_made: number;
        second_chance_pct: number;
        fast_break_att: number;
        fast_break_made: number;
        fast_break_pct: number;
    }

    export interface Statistics {
        minutes: string;
        field_goals_made: number;
        field_goals_att: number;
        field_goals_pct: number;
        three_points_made: number;
        three_points_att: number;
        three_points_pct: number;
        two_points_made: number;
        two_points_att: number;
        two_points_pct: number;
        blocked_att: number;
        free_throws_made: number;
        free_throws_att: number;
        free_throws_pct: number;
        offensive_rebounds: number;
        defensive_rebounds: number;
        rebounds: number;
        assists: number;
        turnovers: number;
        steals: number;
        blocks: number;
        assists_turnover_ratio: number;
        personal_fouls: number;
        ejections: number;
        foulouts: number;
        points: number;
        fast_break_pts: number;
        second_chance_pts: number;
        team_turnovers: number;
        points_off_turnovers: number;
        team_rebounds: number;
        flagrant_fouls: number;
        player_tech_fouls: number;
        team_tech_fouls: number;
        coach_tech_fouls: number;
        points_in_paint: number;
        pls_min: number;
        effective_fg_pct: number;
        bench_points: number;
        points_in_paint_att: number;
        points_in_paint_made: number;
        points_in_paint_pct: number;
        true_shooting_att: number;
        true_shooting_pct: number;
        biggest_lead: number;
        fouls_drawn: number;
        offensive_fouls: number;
        efficiency: number;
        efficiency_game_score: number;
        defensive_rating: number;
        offensive_rating: number;
        coach_ejections: number;
        points_against: number;
        possessions: number;
        opponent_possessions: number;
        team_defensive_rebounds: number;
        team_offensive_rebounds: number;
        time_leading: string;
        defensive_points_per_possession: number;
        offensive_points_per_possession: number;
        team_fouls: number;
        total_rebounds: number;
        total_fouls: number;
        second_chance_att: number;
        second_chance_made: number;
        second_chance_pct: number;
        fast_break_att: number;
        fast_break_made: number;
        fast_break_pct: number;
        most_unanswered: MostUnanswered;
        periods: Period[];
    }

    export interface Coach {
        full_name: string;
        first_name: string;
        last_name: string;
        position: string;
        reference: string;
        id: string;
    }

    export interface Player {
        full_name: string;
        jersey_number: string;
        id: string;
        first_name: string;
        last_name: string;
        position: string;
        primary_position: string;
        not_playing_reason: string;
        not_playing_description: string;
        on_court: boolean;
        reference: string;
        statistics: Statistics;
        played?: boolean;
        active?: boolean;
        starter?: boolean;
        fouled_out?: boolean;
    }

    export interface TeamStatistics {
        name: string;
        alias: string;
        market: string;
        id: string;
        points: number;
        bonus: boolean;
        sr_id: string;
        reference: string;
        scoring: Scoring[];
        statistics: Statistics;
        coaches: Coach[];
        players: Player[];
    }

    export interface Official {
        id: string;
        full_name: string;
        first_name: string;
        last_name: string;
        number: string;
        assignment: string;
        experience: string;
    }

    export interface GameStatistics {
        id: string;
        status: string;
        coverage: string;
        neutral_site: boolean;
        scheduled: Date;
        attendance: number;
        lead_changes: number;
        times_tied: number;
        clock: string;
        quarter: number;
        track_on_court: boolean;
        reference: string;
        entry_mode: string;
        venue: Venue;
        home: TeamStatistics;
        away: TeamStatistics;
        officials: Official[];
    }
}