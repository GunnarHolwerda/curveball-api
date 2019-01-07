export namespace NFLResponse {
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

    export interface Roster {
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
        sr_id: string;
    }

    export interface Team {
        id: string;
        name: string;
        alias: string;
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
        home: Team;
        away: Team;
        broadcast: Broadcast;
        scoring: Scoring;
    }

    export interface Week {
        id: string;
        sequence: number;
        title: string;
        games: Game[];
    }

    export interface SeasonSchedule {
        id: string;
        year: number;
        type: string;
        name: string;
        weeks: Week[];
        _comment: string;
    }

    export interface PlayerStatistic {
        id: string;
        name: string;
        jersey: string;
        reference: string;
        position: string;
    }

    export interface Season {
        id: string;
        year: number;
        type: string;
        name: string;
    }

    export interface Week {
        id: string;
        sequence: number;
        title: string;
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

    export interface Home {
        id: string;
        name: string;
        market: string;
        alias: string;
        reference: string;
        sr_id: string;
        used_timeouts: number;
        remaining_timeouts: number;
        points: number;
    }

    export interface Away {
        id: string;
        name: string;
        market: string;
        alias: string;
        reference: string;
        sr_id: string;
        used_timeouts: number;
        remaining_timeouts: number;
        points: number;
    }

    export interface Summary {
        season: Season;
        week: Week;
        venue: Venue;
        home: Home;
        away: Away;
    }

    export interface Totals {
        avg_yards: number;
        attempts: number;
        touchdowns: number;
        tlost: number;
        tlost_yards: number;
        yards: number;
        longest: number;
        longest_touchdown: number;
        redzone_attempts: number;
        broken_tackles: number;
        kneel_downs: number;
        scrambles: number;
        yards_after_contact: number;
    }

    export interface ReceivingTotals {
        targets: number;
        receptions: number;
        avg_yards: number;
        yards: number;
        touchdowns: number;
        yards_after_catch: number;
        longest: number;
        longest_touchdown: number;
        redzone_targets: number;
        air_yards: number;
        broken_tackles: number;
        dropped_passes: number;
        catchable_passes: number;
        yards_after_contact: number;
    }

    export interface ReceivingStatistics extends PlayerStatistic {
        receptions: number;
        targets: number;
        yards: number;
        avg_yards: number;
        longest: number;
        touchdowns: number;
        longest_touchdown: number;
        yards_after_catch: number;
        redzone_targets: number;
        air_yards: number;
        broken_tackles: number;
        dropped_passes: number;
        catchable_passes: number;
        yards_after_contact: number;
    }

    export interface Receiving {
        totals: ReceivingTotals;
        players: ReceivingStatistics[];
    }

    export interface PuntingTotals {
        attempts: number;
        yards: number;
        net_yards: number;
        blocked: number;
        touchbacks: number;
        inside_20: number;
        return_yards: number;
        avg_net_yards: number;
        avg_yards: number;
        longest: number;
        hang_time: number;
        avg_hang_time: number;
    }

    export interface PuntingStatistics extends PlayerStatistic {
        attempts: number;
        yards: number;
        avg_yards: number;
        blocked: number;
        longest: number;
        touchbacks: number;
        inside_20: number;
        avg_net_yards: number;
        return_yards: number;
        net_yards: number;
        hang_time: number;
        avg_hang_time: number;
    }

    export interface Punts {
        totals: PuntingTotals;
        players: PuntingStatistics[];
    }

    export interface PuntReturnTotals {
        avg_yards: number;
        yards: number;
        longest: number;
        touchdowns: number;
        longest_touchdown: number;
        faircatches: number;
        number: number;
    }

    export interface PuntReturnStatistics extends PlayerStatistic {
        yards: number;
        avg_yards: number;
        touchdowns: number;
        longest: number;
        faircatches: number;
        longest_touchdown: number;
        number: number;
    }

    export interface PuntReturns {
        totals: PuntReturnTotals;
        players: PuntReturnStatistics[];
    }

    export interface PenaltyTotals {
        penalties: number;
        yards: number;
    }

    export interface PenaltyStatistics extends PlayerStatistic {
        position: string;
        penalties: number;
        yards: number;
    }

    export interface Penalties {
        totals: PenaltyTotals;
        players: PenaltyStatistics[];
    }

    export interface PassingTotals {
        attempts: number;
        completions: number;
        cmp_pct: number;
        interceptions: number;
        sack_yards: number;
        rating: number;
        touchdowns: number;
        avg_yards: number;
        sacks: number;
        longest: number;
        longest_touchdown: number;
        air_yards: number;
        redzone_attempts: number;
        net_yards: number;
        yards: number;
        throw_aways: number;
        poor_throws: number;
        defended_passes: number;
        dropped_passes: number;
        spikes: number;
        blitzes: number;
        hurries: number;
        knockdowns: number;
        pocket_time: number;
    }

    export interface PassingStatistics extends PlayerStatistic {
        attempts: number;
        completions: number;
        cmp_pct: number;
        yards: number;
        avg_yards: number;
        sacks: number;
        sack_yards: number;
        touchdowns: number;
        longest: number;
        interceptions: number;
        rating: number;
        longest_touchdown: number;
        air_yards: number;
        redzone_attempts: number;
        throw_aways: number;
        poor_throws: number;
        defended_passes: number;
        dropped_passes: number;
        spikes: number;
        blitzes: number;
        hurries: number;
        knockdowns: number;
        pocket_time: number;
        avg_pocket_time: number;
    }

    export interface Passing {
        totals: PassingTotals;
        players: PassingStatistics[];
    }

    export interface ReturnTotals {
        yards: number;
        touchdowns: number;
        blk_fg_touchdowns: number;
        blk_punt_touchdowns: number;
        fg_return_touchdowns: number;
        ez_rec_touchdowns: number;
        number: number;
    }

    export interface MiscReturns {
        totals: ReturnTotals;
        players: any[];
    }

    export interface KickoffTotals {
        endzone: number;
        inside_20: number;
        return_yards: number;
        touchbacks: number;
        yards: number;
        out_of_bounds: number;
        number: number;
        onside_attempts: number;
        onside_successes: number;
        squib_kicks: number;
        total_endzone: number;
    }

    export interface KickoffStatistics extends PlayerStatistic {
        endzone: number;
        inside_20: number;
        return_yards: number;
        touchbacks: number;
        yards: number;
        out_of_bounds: number;
        number: number;
        onside_attempts: number;
        onside_successes: number;
        squib_kicks: number;
        total_endzone: number;
    }

    export interface Kickoffs {
        totals: KickoffTotals;
        players: KickoffStatistics[];
    }

    export interface KickReturnTotals {
        avg_yards: number;
        yards: number;
        longest: number;
        touchdowns: number;
        longest_touchdown: number;
        faircatches: number;
        number: number;
    }

    export interface KickReturnStatistics extends PlayerStatistic {
        avg_yards: number;
        yards: number;
        longest: number;
        touchdowns: number;
        longest_touchdown: number;
        faircatches: number;
        number: number;
    }

    export interface KickReturns {
        totals: KickReturnTotals;
        players: KickReturnStatistics[];
    }

    export interface InterceptionReturnTotals {
        avg_yards: number;
        yards: number;
        longest: number;
        touchdowns: number;
        longest_touchdown: number;
        number: number;
    }

    export interface InterceptionReturnStatistics extends PlayerStatistic {
        avg_yards: number;
        yards: number;
        longest: number;
        touchdowns: number;
        longest_touchdown: number;
        number: number;
    }

    export interface IntReturns {
        totals: InterceptionReturnTotals;
        players: InterceptionReturnStatistics[];
    }

    export interface FumbleTotals {
        fumbles: number;
        lost_fumbles: number;
        own_rec: number;
        own_rec_yards: number;
        opp_rec: number;
        opp_rec_yards: number;
        out_of_bounds: number;
        forced_fumbles: number;
        own_rec_tds: number;
        opp_rec_tds: number;
        ez_rec_tds: number;
    }

    export interface FumblePlayerStatistics extends PlayerStatistic {
        fumbles: number;
        lost_fumbles: number;
        own_rec: number;
        own_rec_yards: number;
        opp_rec: number;
        opp_rec_yards: number;
        out_of_bounds: number;
        forced_fumbles: number;
        own_rec_tds: number;
        opp_rec_tds: number;
        ez_rec_tds: number;
    }

    export interface Fumbles {
        totals: FumbleTotals;
        players: FumblePlayerStatistics[];
    }

    export interface FieldGoalTotals {
        attempts: number;
        made: number;
        blocked: number;
        yards: number;
        avg_yards: number;
        longest: number;
        net_attempts: number;
    }

    export interface FieldGoalStatistics extends PlayerStatistic {
        attempts: number;
        made: number;
        blocked: number;
        yards: number;
        avg_yards: number;
        longest: number;
    }

    export interface FieldGoals {
        totals: FieldGoalTotals;
        players: FieldGoalStatistics[];
    }

    export interface ExtraPointTotals {
        attempts: number;
        blocked: number;
        made: number;
    }

    export interface ExtraPointStatistics extends PlayerStatistic {
        attempts: number;
        blocked: number;
        made: number;
    }

    export interface Kicks {
        totals: ExtraPointTotals;
        players: ExtraPointStatistics[];
    }

    export interface ConversionTotals {
        pass_attempts: number;
        pass_successes: number;
        rush_attempts: number;
        rush_successes: number;
        defense_attempts: number;
        defense_successes: number;
        turnover_successes: number;
    }

    export interface Conversions {
        totals: ConversionTotals;
        players: any[];
    }

    export interface ExtraPoints {
        kicks: Kicks;
        conversions: Conversions;
    }

    export interface DefensiveTotals {
        tackles: number;
        assists: number;
        combined: number;
        sacks: number;
        sack_yards: number;
        interceptions: number;
        passes_defended: number;
        forced_fumbles: number;
        fumble_recoveries: number;
        qb_hits: number;
        tloss: number;
        tloss_yards: number;
        safeties: number;
        sp_tackles: number;
        sp_assists: number;
        sp_forced_fumbles: number;
        sp_fumble_recoveries: number;
        sp_blocks: number;
        misc_tackles: number;
        misc_assists: number;
        misc_forced_fumbles: number;
        misc_fumble_recoveries: number;
        def_targets: number;
        def_comps: number;
        blitzes: number;
        hurries: number;
        knockdowns: number;
        missed_tackles: number;
    }

    export interface DefensiveStatistics extends PlayerStatistic {
        tackles: number;
        assists: number;
        combined: number;
        sacks: number;
        sack_yards: number;
        interceptions: number;
        passes_defended: number;
        forced_fumbles: number;
        fumble_recoveries: number;
        qb_hits: number;
        tloss: number;
        tloss_yards: number;
        safeties: number;
        sp_tackles: number;
        sp_assists: number;
        sp_forced_fumbles: number;
        sp_fumble_recoveries: number;
        sp_blocks: number;
        misc_tackles: number;
        misc_assists: number;
        misc_forced_fumbles: number;
        misc_fumble_recoveries: number;
        def_targets: number;
        def_comps: number;
        blitzes: number;
        hurries: number;
        knockdowns: number;
        missed_tackles: number;
    }

    export interface Defense {
        totals: DefensiveTotals;
        players: DefensiveStatistics[];
    }

    export interface Goaltogo {
        attempts: number;
        successes: number;
        pct: number;
    }

    export interface Redzone {
        attempts: number;
        successes: number;
        pct: number;
    }

    export interface Thirddown {
        attempts: number;
        successes: number;
        pct: number;
    }

    export interface Fourthdown {
        attempts: number;
        successes: number;
        pct: number;
    }

    export interface Efficiency {
        goaltogo: Goaltogo;
        redzone: Redzone;
        thirddown: Thirddown;
        fourthdown: Fourthdown;
    }

    export interface FirstDowns {
        pass: number;
        penalty: number;
        rush: number;
        total: number;
    }

    export interface Interceptions {
        return_yards: number;
        returned: number;
        number: number;
    }

    export interface Touchdowns {
        pass: number;
        rush: number;
        total_return: number;
        total: number;
        fumble_return: number;
        int_return: number;
        kick_return: number;
        punt_return: number;
        other: number;
    }

    export interface TeamSummary {
        possession_time: string;
        avg_gain: number;
        safeties: number;
        turnovers: number;
        play_count: number;
        rush_plays: number;
        total_yards: number;
        fumbles: number;
        lost_fumbles: number;
        penalties: number;
        penalty_yards: number;
        return_yards: number;
    }

    export interface RushingTotals {
        avg_yards: number;
        attempts: number;
        touchdowns: number;
        tlost: number;
        tlost_yards: number;
        yards: number;
        longest: number;
        longest_touchdown: number;
        redzone_attempts: number;
        broken_tackles: number;
        kneel_downs: number;
        scrambles: number;
        yards_after_contact: number;
    }

    export interface RushingStatistics extends PlayerStatistic {
        avg_yards: number;
        attempts: number;
        touchdowns: number;
        yards: number;
        longest: number;
        longest_touchdown: number;
        redzone_attempts: number;
        tlost: number;
        tlost_yards: number;
        broken_tackles: number;
        kneel_downs: number;
        scrambles: number;
        yards_after_contact: number;
    }

    export interface Rushing {
        totals: RushingTotals;
        players: RushingStatistics[];
    }

    export interface MiscReturnTotals {
        yards: number;
        touchdowns: number;
        blk_fg_touchdowns: number;
        blk_punt_touchdowns: number;
        fg_return_touchdowns: number;
        ez_rec_touchdowns: number;
        number: number;
    }

    export interface MiscReturns {
        totals: MiscReturnTotals;
        players: any[];
    }

    export interface Goaltogo2 {
        attempts: number;
        successes: number;
        pct: number;
    }

    export interface Redzone2 {
        attempts: number;
        successes: number;
        pct: number;
    }

    export interface Thirddown2 {
        attempts: number;
        successes: number;
        pct: number;
    }

    export interface Fourthdown2 {
        attempts: number;
        successes: number;
        pct: number;
    }

    export interface Efficiency {
        goaltogo: Goaltogo2;
        redzone: Redzone2;
        thirddown: Thirddown2;
        fourthdown: Fourthdown2;
    }

    export interface FirstDowns {
        pass: number;
        penalty: number;
        rush: number;
        total: number;
    }

    export interface Interceptions {
        return_yards: number;
        returned: number;
        number: number;
    }

    export interface Touchdowns {
        pass: number;
        rush: number;
        total_return: number;
        total: number;
        fumble_return: number;
        int_return: number;
        kick_return: number;
        punt_return: number;
        other: number;
    }

    export interface TeamStatistics {
        id: string;
        name: string;
        market: string;
        alias: string;
        reference: string;
        sr_id: string;
        summary: TeamSummary;
        rushing: Rushing;
        receiving: Receiving;
        punts: Punts;
        punt_returns: PuntReturns;
        penalties: Penalties;
        passing: Passing;
        misc_returns: MiscReturns;
        kickoffs: Kickoffs;
        kick_returns: KickReturns;
        int_returns: IntReturns;
        fumbles: Fumbles;
        field_goals: FieldGoals;
        extra_points: ExtraPoints;
        defense: Defense;
        efficiency: Efficiency;
        first_downs: FirstDowns;
        interceptions: Interceptions;
        touchdowns: Touchdowns;
    }

    export interface Statistics {
        home: TeamStatistics;
        away: TeamStatistics;
    }

    export interface GameStatistics {
        id: string;
        status: string;
        reference: string;
        number: number;
        scheduled: Date;
        attendance: number;
        utc_offset: number;
        entry_mode: string;
        weather: string;
        clock: string;
        quarter: number;
        summary: Summary;
        statistics: Statistics;
        _comment: string;
    }
}