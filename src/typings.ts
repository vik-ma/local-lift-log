export type Routine = {
    id: number;
    name: string;
    note?: string | null;
    is_schedule_weekly: boolean;
    num_days_in_schedule: number;
    custom_schedule_start_date?: string | null;
  };