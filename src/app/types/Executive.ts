interface ExecutivePosition {
  title: string;
  start_date: Date;
  end_date: Date | null;
}

export interface Executive {
  id: number;
  name: string;
  quote: string;
  avatar_path: string;
  positions: ExecutivePosition[];
}
