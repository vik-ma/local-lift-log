export type Routine = {
  id: number;
  name: string;
  note?: string | null;
  is_schedule_weekly: string;
  num_days_in_schedule: number;
  custom_schedule_start_date?: string | null;
};

export type RoutineListItem = {
  id: number;
  name: string;
};

export type UserSettings = {
  id: number;
  show_timestamp_on_completed_set: string;
  active_routine_id: number;
};

export type Exercise = {
  id: number;
  name: string;
  exercise_group_set_string: string;
  note?: string | null;
};

export type ExerciseListItem = {
  id: number;
  name: string;
  exercise_group_set: Set<string>;
  exercise_group_string: string;
};

export type ExerciseGroupMap = Map<string, string>;
