export interface HeldEvent {
    meeting_id: number;
    cube_name: string;
    format: string;
    rounds: number;
    Cubes: {
      cube_name: string;
      icon_link: string;
      order: number;
    };
    FormatAttempts: {
      format: string;
      max_attempts: number;
    };
  }