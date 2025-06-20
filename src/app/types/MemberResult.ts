export interface MemberResult {
    cube_name: string,
    icon_link: string,
    meeting_name: string,
    round: number,
    member_id: number,
    name: string,
    avg_time_ms: number | null,
    best_single_time_ms: number,
    place_in_round: number,
    all_times: number[],
};
