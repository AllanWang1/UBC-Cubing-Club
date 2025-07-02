export interface Result {
    attempt: number;
    round: number;
    id: number;
    cube_name: string;
    meeting_id: number;
    time_ms: number;
    record: boolean;
    average_record: boolean;
    penalty: string | null;
    raw_time_ms: number;
}