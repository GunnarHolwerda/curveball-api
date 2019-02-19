export namespace NFLResponse {
    export interface Season {
        season: number;
        type: string;
        weeks: (WeeksEntity)[];
    }
    export interface WeeksEntity {
        id: string;
        number: number;
        games: (GamesEntity)[];
        bye_week?: (string)[];
    }
    export interface GamesEntity {
        id: string;
        scheduled: string;
        home_rotation: string;
        away_rotation: string;
        home: string;
        away: string;
        status: string;
        venue: Venue;
        broadcast: Broadcast;
        weather: Weather;
    }

    export interface Broadcast {
        network: string;
        satellite?: string | null;
        internet?: string | null;
    }
    export interface Weather {
        temperature: number;
        condition: string;
        humidity: number;
        wind: Wind;
    }
    export interface Wind {
        speed: number;
        direction: string;
    }

    export interface TeamHierarchy {
        league: string;
        conferences: Array<ConferencesEntity>;
    }
    export interface ConferencesEntity {
        id: string;
        name: string;
        divisions: Array<DivisionsEntity>;
    }
    export interface DivisionsEntity {
        id: string;
        name: string;
        teams: Array<Teams>;
    }
    export interface Teams {
        id: string;
        name: string;
        market: string;
        venue: Venue;
    }
    export interface Venue {
        id: string;
        country: string;
        name: string;
        city: string;
        state: string;
        capacity: number;
        surface: string;
        type: string;
        zip?: string | null;
        address: string;
    }

    export interface Roster {
        id: string;
        name: string;
        market: string;
        players: (PlayersEntity)[];
        coaches: (CoachesEntity)[];
    }
    export interface PlayersEntity {
        id: string;
        name_full: string;
        name_first: string;
        name_last: string;
        name_abbr: string;
        birthdate: string;
        birth_place: string;
        high_school?: string | null;
        height: number;
        weight: number;
        college: string;
        position: string;
        jersey_number: number;
        status: string;
        salary: number;
        experience?: string | null;
        draft_pick?: string | null;
        draft_round?: string | null;
        draft_year?: number | null;
        draft_team?: string | null;
    }
    export interface CoachesEntity {
        id: string;
        name_full: string;
        name_first: string;
        name_last: string;
        name_abbr: string;
        position: string;
        status: string;
        salary: number;
    }

    export interface PlayerStatistic {
        id: string;
        name: string;
        jersey: number;
        position: string;
    }

    export interface GameStatistics {
        id: string;
        scheduled: string;
        status: string;
        home_team: HomeTeam;
        away_team: AwayTeam;
    }
    export interface HomeTeam {
        id: string;
        name: string;
        market: string;
        remaining_challenges: number;
        remaining_timeouts: number;
        points: number;
        statistics: Statistics;
    }
    export interface Statistics {
        touchdowns: Touchdowns;
        third_down_efficiency: ThirdDownEfficiencyOrFourthDownEfficiency;
        rushing: Rushing;
        redzone_efficiency: RedzoneEfficiencyOrGoalEfficiency;
        receiving: Receiving;
        punting: Punting;
        punt_return: PuntReturnOrKickReturn;
        penalty: Penalty;
        passing: Passing;
        kickoffs: Kickoffs;
        kick_return: PuntReturnOrKickReturn;
        goal_efficiency: RedzoneEfficiencyOrGoalEfficiency;
        fumbles: Fumbles;
        fourth_down_efficiency: ThirdDownEfficiencyOrFourthDownEfficiency;
        first_downs: FirstDowns;
        field_goal: FieldGoal;
        extra_point: ExtraPoint;
        defense: Defense;
    }
    export interface Touchdowns {
        team: TeamTouchdownStatistics;
        players?: (PlayerTouchdownStatistics)[] | null;
    }
    export interface TeamTouchdownStatistics {
        pass: number;
        rush: number;
        int: number;
        fum_ret: number;
        punt_ret: number;
        kick_ret: number;
        fg_ret: number;
        other: number;
    }
    export interface PlayerTouchdownStatistics extends PlayerStatistic {
        pass: number;
        rush: number;
        int: number;
        fum_ret: number;
        punt_ret: number;
        kick_ret: number;
        fg_ret: number;
        other: number;
    }
    export interface ThirdDownEfficiencyOrFourthDownEfficiency {
        team: TeamThirdAndFourthDownEfficiency;
    }
    export interface TeamThirdAndFourthDownEfficiency {
        att: number;
        conv: number;
        pct: number;
        pass: number;
        rush: number;
        pen: number;
    }
    export interface Rushing {
        team: TeamRushingStatistics;
        players?: (PlayerRushingStatistics)[] | null;
    }
    export interface TeamRushingStatistics {
        att: number;
        yds: number;
        avg: number;
        lg: number;
        td: number;
        fd: number;
        fd_pct: number;
        sfty: number;
        rz_att: number;
        fum: number;
        yds_10_pls: number;
        yds_20_pls: number;
        yds_30_pls: number;
        yds_40_pls: number;
        yds_50_pls: number;
    }
    export interface PlayerRushingStatistics extends PlayerStatistic {
        att: number;
        yds: number;
        avg: number;
        lg: number;
        td: number;
        fd: number;
        fd_pct: number;
        sfty: number;
        rz_att: number;
        fum: number;
        yds_10_pls: number;
        yds_20_pls: number;
        yds_30_pls: number;
        yds_40_pls: number;
        yds_50_pls: number;
    }
    export interface RedzoneEfficiencyOrGoalEfficiency {
        team: TeamRedzoneEfficiency;
    }
    export interface TeamRedzoneEfficiency {
        att: number;
        td: number;
        pct: number;
    }
    export interface Receiving {
        team: TeamReceivingStats;
        players?: (PlayerReceivingStats)[] | null;
    }
    export interface TeamReceivingStats {
        tar: number;
        rec: number;
        yds: number;
        yac: number;
        fd: number;
        avg: number;
        td: number;
        lg: number;
        rz_tar: number;
        fum: number;
        yds_10_pls: number;
        yds_20_pls: number;
        yds_30_pls: number;
        yds_40_pls: number;
        yds_50_pls: number;
    }
    export interface PlayerReceivingStats extends PlayerStatistic {
        tar: number;
        rec: number;
        yds: number;
        yac: number;
        fd: number;
        avg: number;
        td: number;
        lg: number;
        rz_tar: number;
        fum: number;
        yds_10_pls: number;
        yds_20_pls: number;
        yds_30_pls: number;
        yds_40_pls: number;
        yds_50_pls: number;
    }
    export interface Punting {
        team: TeamPuntingStats;
        players?: (PlayerPuntingStats)[] | null;
    }
    export interface TeamPuntingStats {
        punts: number;
        yds: number;
        net_yds: number;
        lg: number;
        blk: number;
        in20: number;
        tb: number;
        ret: number;
        sfty: number;
        avg: number;
        net_avg: number;
        ret_yds: number;
        avg_ret: number;
        in20_pct: number;
        tb_pct: number;
    }
    export interface PlayerPuntingStats extends PlayerStatistic {
        punts: number;
        yds: number;
        net_yds: number;
        lg: number;
        blk: number;
        in20: number;
        tb: number;
        ret: number;
        sfty: number;
        avg: number;
        net_avg: number;
        ret_yds: number;
        avg_ret: number;
        in20_pct: number;
        tb_pct: number;
    }
    export interface PuntReturnOrKickReturn {
        team: TeamReturnStats;
        players?: (PlayerReturnStatistics)[] | null;
    }
    export interface TeamReturnStats {
        returns: number;
        yds: number;
        fc: number;
        lg: number;
        td: number;
        avg: number;
        yds_10_pls: number;
        yds_20_pls: number;
        yds_30_pls: number;
        yds_40_pls: number;
        yds_50_pls: number;
    }
    export interface PlayerReturnStatistics extends PlayerStatistic {
        returns: number;
        yds: number;
        fc: number;
        lg: number;
        td: number;
        avg: number;
        yds_10_pls: number;
        yds_20_pls: number;
        yds_30_pls: number;
        yds_40_pls: number;
        yds_50_pls: number;
    }
    export interface Penalty {
        team: TeamPenaltyStatistics;
        players?: (PlayerPenaltyStatistics)[] | null;
    }
    export interface TeamPenaltyStatistics {
        num: number;
        yds: number;
        fd: number;
    }
    export interface PlayerPenaltyStatistics extends PlayerStatistic {
        num: number;
        yds: number;
        fd: number;
    }
    export interface Passing {
        team: TeamPassingStatistics;
        players?: (PlayerPassingStatistics)[] | null;
    }
    export interface TeamPassingStatistics {
        att: number;
        cmp: number;
        yds: number;
        lg: number;
        sk: number;
        sk_yds: number;
        td: number;
        int: number;
        int_td: number;
        fd: number;
        sfty: number;
        rz_att: number;
        rating: number;
        avg: number;
        cmp_pct: number;
        cmp_avg: number;
        td_pct: number;
        int_pct: number;
        yds_10_pls: number;
        yds_20_pls: number;
        yds_30_pls: number;
        yds_40_pls: number;
        yds_50_pls: number;
    }
    export interface PlayerPassingStatistics extends PlayerStatistic {
        att: number;
        cmp: number;
        yds: number;
        lg: number;
        sk: number;
        sk_yds: number;
        td: number;
        int: number;
        int_td: number;
        fd: number;
        sfty: number;
        rz_att: number;
        rating: number;
        avg: number;
        cmp_pct: number;
        cmp_avg: number;
        td_pct: number;
        int_pct: number;
        yds_10_pls: number;
        yds_20_pls: number;
        yds_30_pls: number;
        yds_40_pls: number;
        yds_50_pls: number;
    }
    export interface Kickoffs {
        team: TeamKickoffStatistics;
        players?: (PlayerKickoffStatistics)[] | null;
    }
    export interface TeamKickoffStatistics {
        kicks: number;
        yds: number;
        net_yds: number;
        lg: number;
        endzone: number;
        in20: number;
        tb: number;
        ret: number;
        avg: number;
        net_avg: number;
        ret_yds: number;
        avg_ret: number;
        in20_pct: number;
        tb_pct: number;
    }
    export interface PlayerKickoffStatistics extends PlayerStatistic {
        kicks: number;
        yds: number;
        net_yds: number;
        lg: number;
        endzone: number;
        in20: number;
        tb: number;
        ret: number;
        avg: number;
        net_avg: number;
        ret_yds: number;
        in20_pct: number;
        tb_pct: number;
    }
    export interface Fumbles {
        team: TeamFumbleStatistics;
        players?: (PlayerFumbleStatistics)[] | null;
    }
    export interface TeamFumbleStatistics {
        fum: number;
        lost: number;
        oob: number;
        own_rec: number;
        own_rec_yds: number;
        own_rec_td: number;
        force_fum: number;
        opp_rec: number;
        opp_rec_yds: number;
        opp_rec_td: number;
    }
    export interface PlayerFumbleStatistics extends PlayerStatistic {
        fum: number;
        lost: number;
        oob: number;
        own_rec: number;
        own_rec_yds: number;
        own_rec_td: number;
        force_fum: number;
        opp_rec: number;
        opp_rec_yds: number;
        opp_rec_td: number;
    }
    export interface FirstDowns {
        team: TeamFirstDownStatistics;
        players?: (PlayerFirstDownStatistics)[] | null;
    }
    export interface TeamFirstDownStatistics {
        num: number;
        pass: number;
        rush: number;
        pen: number;
    }
    export interface PlayerFirstDownStatistics extends PlayerStatistic {
        num: number;
        pass: number;
        rush: number;
        pen: number;
    }
    export interface FieldGoal {
        team: TeamFieldGoalStats;
        players?: (PlayerFieldGoalStats)[] | null;
    }
    export interface TeamFieldGoalStats {
        att: number;
        made: number;
        pct: number;
        lg: number;
        att_19: number;
        made_19: number;
        att_29: number;
        made_29: number;
        att_39: number;
        made_39: number;
        att_49: number;
        made_49: number;
        att_50: number;
        made_50: number;
    }
    export interface PlayerFieldGoalStats extends PlayerStatistic {
        att: number;
        made: number;
        pct: number;
        lg: number;
        blk: number;
        att_19: number;
        made_19: number;
        att_29: number;
        made_29: number;
        att_39: number;
        made_39: number;
        att_49: number;
        made_49: number;
        att_50: number;
        made_50: number;
    }
    export interface ExtraPoint {
        team: TeamExtraPointStatistics;
        players?: (PlayerExtraPointStatistics)[] | null;
    }
    export interface TeamExtraPointStatistics {
        att: number;
        made: number;
        pct: number;
        blk: number;
    }
    export interface PlayerExtraPointStatistics extends PlayerStatistic {
        att: number;
        made: number;
        pct: number;
        blk: number;
    }
    export interface Defense {
        team: TeamDefenseStatistics;
        players?: (PlayerDefenseStatistics)[] | null;
    }
    export interface TeamDefenseStatistics {
        tackle: number;
        ast: number;
        comb: number;
        tlost: number;
        sack: number;
        sack_yds: number;
        sfty: number;
        int: number;
        int_yds: number;
        int_lg: number;
        int_td: number;
        force_fum: number;
        fum_rec: number;
        fum_td: number;
        qh: number;
        pd: number;
        bk: number;
        sfty_1pt: number;
        sp_tackle: number;
        sp_ast: number;
        sp_comb: number;
        sp_force_fum: number;
        sp_fum_rec: number;
        misc_tackle: number;
        misc_ast: number;
        misc_comb: number;
        misc_force_fum: number;
        misc_fum_rec: number;
    }
    export interface PlayerDefenseStatistics extends PlayerStatistic {
        tackle: number;
        ast: number;
        comb: number;
        tlost: number;
        sack: number;
        sack_yds: number;
        sfty: number;
        int: number;
        int_yds: number;
        int_lg: number;
        int_td: number;
        force_fum: number;
        fum_rec: number;
        fum_td: number;
        qh: number;
        pd: number;
        bk: number;
        sfty_1pt: number;
        sp_tackle: number;
        sp_ast: number;
        sp_comb: number;
        sp_force_fum: number;
        sp_fum_rec: number;
        misc_tackle: number;
        misc_ast: number;
        misc_comb: number;
        misc_force_fum: number;
        misc_fum_rec: number;
    }
    export interface AwayTeam {
        id: string;
        name: string;
        market: string;
        remaining_challenges: number;
        remaining_timeouts: number;
        points: number;
        statistics: Statistics;
    }
}