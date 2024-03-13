export type Routine = {
  id: number;
  name: string;
  note: string | null;
  is_schedule_weekly: string;
  num_days_in_schedule: number;
  custom_schedule_start_date: string | null;
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
  note: string | null;
};

export type ExerciseListItem = {
  id: number;
  name: string;
  exercise_group_list: string[];
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
}

export type Set = {
  id: number;
  workout_id: number;
  exercise_id: number;
  is_template: string;
  workout_template_id: number;
  note: string | null;
  comment: string | null;
  is_completed: string;
  time_completed: string;
  is_warmup: string;
  weight: number;
  reps: number;
  rir: number;
  rpe: number;
  time_in_seconds: number;
  distance: number;
  resistance_level: number;
  is_tracking_weight: string;
  is_tracking_reps: string;
  is_tracking_rir: string;
  is_tracking_rpe: string;
  is_tracking_time: string;
  is_tracking_distance: string;
  is_tracking_resistance_level: string;
  weight_unit: string;
  distance_unit: string;
};
