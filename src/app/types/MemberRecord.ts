export interface MemberRecord {
  id: number;
  name: string;
  faculty_full_name: string;
  faculty_icon_link: string;
  cube_name: string;
  icon_link: string;
  cube_order: number;
  single_time_ms: number;
  single_rank: number;
  single_meeting_id: number;
  single_meeting_name: string;
  avg_time_ms: number;
  avg_rank: number;
  avg_meeting_id: number;
  avg_meeting_name: string;
}