export type Routine = {
  id: number;
  name: string;
  note: string | null;
  is_schedule_weekly: number;
  num_days_in_schedule: number;
  custom_schedule_start_date: string | null;
};

export type RoutineListItem = {
  id: number;
  name: string;
};

export type UserSettings = {
  id: number;
  show_timestamp_on_completed_set: number;
  active_routine_id: number;
  default_unit_weight: string;
  default_unit_distance: string;
};

export type UserSettingsOptional = {
  id: number;
  show_timestamp_on_completed_set?: number;
  active_routine_id?: number;
  default_unit_weight?: string;
  default_unit_distance?: string;
};

export type Exercise = {
  id: number;
  name: string;
  exercise_group_set_string: string;
  note: string | null;
};

export type ExerciseListItem = {
  id: number;
  name: string;
  exercise_group_list: string[];
  exercise_group_string: string;
};

export type ExerciseWithGroupString = {
  id: number;
  name: string;
  exercise_group_string: string;
};

export type WorkoutTemplate = {
  id: number;
  name: string;
  set_list_order: string;
  note: string | null;
};

export type WorkoutTemplateListItem = {
  id: number;
  name: string;
};

export type WorkoutTemplatesSchedule = {
  id: number;
  day: number;
  workout_template_id: number;
  routine_id: number;
};

export type RoutineScheduleItem = {
  id: number;
  day: number;
  workout_template_id: number;
  name: string;
};

export type WorkoutSet = {
  id: number;
  workout_id: number;
  exercise_id: number;
  is_template: number;
  workout_template_id: number;
  note: string | null;
  comment: string | null;
  is_completed: number;
  time_completed: string | null;
  is_warmup: number;
  weight: number;
  reps: number;
  rir: number;
  rpe: number;
  time_in_seconds: number;
  distance: number;
  resistance_level: number;
  is_tracking_weight: number;
  is_tracking_reps: number;
  is_tracking_rir: number;
  is_tracking_rpe: number;
  is_tracking_time: number;
  is_tracking_distance: number;
  is_tracking_resistance_level: number;
  weight_unit: string;
  distance_unit: string;
  exercise_name?: string;
};
