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
  default_time_input: string;
  default_unit_measurement: string;
  active_tracking_measurements: string;
  locale: string;
  clock_style: string;
  time_input_behavior_hhmmss: string;
  time_input_behavior_mmss: string;
  show_workout_rating: number;
};

export type UserSettingsOptional = {
  id: number;
  show_timestamp_on_completed_set?: number;
  active_routine_id?: number;
  default_unit_weight?: string;
  default_unit_distance?: string;
  default_time_input?: string;
  default_unit_measurement?: string;
  active_tracking_measurements?: string;
  locale?: string;
  clock_style?: string;
  time_input_behavior_hhmmss?: string;
  time_input_behavior_mmss?: string;
  show_workout_rating?: number;
};

export type Exercise = {
  id: number;
  name: string;
  exercise_group_set_string: string;
  note: string | null;
  exerciseGroupStringList?: string[];
  formattedGroupString?: string;
  isInvalid?: boolean;
};

export type ExerciseGroupMap = Map<string, string>;

export type WorkoutTemplate = {
  id: number;
  name: string;
  exercise_order: string;
  note: string | null;
};

export type WorkoutTemplateListItem = {
  id: number;
  name: string;
};

export type WorkoutRoutineSchedule = {
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
  is_superset: number;
  is_dropset: number;
  multiset_values: string | null;
  exercise_name?: string;
  set_index?: number;
};

export type GroupedWorkoutSet = {
  exercise: Exercise;
  setList: WorkoutSet[];
  isExpanded: boolean;
  showExerciseNote?: boolean;
};

export type SetWorkoutSetAction = React.Dispatch<
  React.SetStateAction<WorkoutSet>
>;

export type SetMeasurementsAction = React.Dispatch<
  React.SetStateAction<Measurement[]>
>;

export type SetMeasurementAction = React.Dispatch<
  React.SetStateAction<Measurement>
>;

export type HTMLSelectElementChange = (
  e: React.ChangeEvent<HTMLSelectElement>
) => Promise<void>;

export type UnitDropdownProps = {
  value: string;
  setSet?: SetWorkoutSetAction;
  setUserSettings?: HTMLSelectElementChange;
  setState?: React.Dispatch<React.SetStateAction<string>>;
  targetType: "set" | "settings" | "state";
};

export type MeasurementDropdownProps = {
  measurement?: Measurement;
  isDisabled?: boolean;
  measurements?: Measurement[];
  setMeasurements?: SetMeasurementsAction;
  setMeasurement?: SetMeasurementAction;
  value?: string;
  setUserSettings?: HTMLSelectElementChange;
  targetType: "modal" | "list" | "settings" | "active";
};

export type WorkoutRatingProps = {
  rating: number;
  workout_id: number;
};

export type SetTrackingValuesInput = {
  weight: string;
  reps: string;
  rir: string;
  rpe: string;
  distance: string;
  resistance_level: string;
};

export type SetTrackingValuesNumbers = {
  weight: number;
  reps: number;
  rir: number;
  rpe: number;
  distance: number;
  resistance_level: number;
};

export type SetTrackingValuesValidity = {
  weight: boolean;
  reps: boolean;
  rir: boolean;
  rpe: boolean;
  distance: boolean;
  resistance_level: boolean;
};

export type Workout = {
  id: number;
  workout_template_id: number;
  date: string;
  exercise_order: string;
  note: string | null;
  is_loaded: number;
  rating: number;
};

export type WorkoutListItem = {
  id: number;
  date: string;
  rating: number;
};

export type UserWeight = {
  id: number;
  weight: number;
  weight_unit: string;
  date: string;
  formattedDate: string;
  comment: string | null;
};

export type EquipmentWeight = {
  id: number;
  name: string;
  weight: number;
  weight_unit: string;
};

export type Distance = {
  id: number;
  name: string;
  distance: number;
  distance_unit: string;
};

export type Measurement = {
  id: number;
  name: string;
  default_unit: string;
  measurement_type: string;
  input?: string;
};

export type UserMeasurement = {
  id: number;
  measurement_id: number;
  value: number;
  unit: string;
  user_measurement_entry_id: number;
  name?: string;
  type?: string;
};

export type UserMeasurementEntry = {
  id: number;
  date: string;
  comment: string | null;
  measurementList?: UserMeasurement[];
  measurementListString?: string;
};

export type SetListNotes = {
  [key: number]: Set<number>;
};

export type SetListOptionsItem = {
  key: string;
  label: string;
  className?: string;
};

export type ActiveSetNote = {
  note: string;
  note_type: "Set Note" | "Exercise Note" | "Comment";
};
