import React, { ReactNode } from "react";

export type Routine = {
  id: number;
  name: string;
  note: string | null;
  is_schedule_weekly: number;
  num_days_in_schedule: number;
  custom_schedule_start_date: string | null;
  numWorkoutTemplates?: number;
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
  set_count?: number;
};

export type ExerciseGroupMap = Map<string, string>;

export type WorkoutTemplate = {
  id: number;
  name: string;
  exercise_order: string;
  note: string | null;
  numSets?: number;
  numExercises?: number;
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
  partial_reps: number;
  is_tracking_weight: number;
  is_tracking_reps: number;
  is_tracking_rir: number;
  is_tracking_rpe: number;
  is_tracking_time: number;
  is_tracking_distance: number;
  is_tracking_resistance_level: number;
  is_tracking_partial_reps: number;
  weight_unit: string;
  distance_unit: string;
  multiset_id: number;
  exercise_name?: string;
  set_index?: number;
  hasInvalidExerciseId?: boolean;
};

export type GroupedWorkoutSet = {
  exerciseList: Exercise[];
  setList: WorkoutSet[];
  isExpanded: boolean;
  showExerciseNote?: boolean;
  isMultiset?: boolean;
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

export type SetUserWeightAction = React.Dispatch<
  React.SetStateAction<UserWeight>
>;

export type HTMLSelectElementChange = (
  e: React.ChangeEvent<HTMLSelectElement>
) => Promise<void>;

export type UnitDropdownProps = {
  value: string;
  setSet?: SetWorkoutSetAction;
  setUserSettings?: HTMLSelectElementChange;
  setState?: React.Dispatch<React.SetStateAction<string>>;
  setEquipmentWeight?: React.Dispatch<React.SetStateAction<EquipmentWeight>>;
  setDistance?: React.Dispatch<React.SetStateAction<Distance>>;
  targetType: "set" | "settings" | "state" | "equipment" | "distance";
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
  isInModal?: boolean;
  setWorkout?: React.Dispatch<React.SetStateAction<Workout>>;
  setWorkouts?: React.Dispatch<React.SetStateAction<Workout[]>>;
};

export type SetTrackingValuesInput = {
  weight: string;
  reps: string;
  rir: string;
  rpe: string;
  distance: string;
  resistance_level: string;
  partial_reps: string;
};

export type SetTrackingValuesNumbers = {
  weight: number;
  reps: number;
  rir: number;
  rpe: number;
  distance: number;
  resistance_level: number;
  partial_reps: number;
};

export type SetTrackingValuesValidity = {
  weight: boolean;
  reps: boolean;
  rir: boolean;
  rpe: boolean;
  distance: boolean;
  resistance_level: boolean;
  partial_reps: boolean;
};

export type Workout = {
  id: number;
  workout_template_id: number;
  date: string;
  exercise_order: string;
  note: string | null;
  is_loaded: number;
  rating: number;
  numSets?: number;
  numExercises?: number;
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

export type MeasurementMap = Map<string, Measurement>;

export type UserMeasurement = {
  id: number;
  date: string;
  comment: string | null;
  measurement_values: string;
  measurementListText?: ReactNode;
  formattedDate?: string;
  isExpanded?: boolean;
  userMeasurementValues?: UserMeasurementValues;
  isInvalid?: boolean;
};

export type UserMeasurementValues = {
  [key: string]: {
    unit: string;
    value: number;
    measurement_type: string;
    isInvalid?: boolean;
  };
};

export type ReassignMeasurementsProps = {
  id: string;
  unit: string;
  measurement_type: string;
};

export type SetListNotes = {
  [key: number]: Set<number>;
};

export type ActiveSetNote = {
  note: string;
  note_type: "Set Note" | "Exercise Note" | "Comment";
};

export type Multiset = {
  id: number;
  multiset_type: number;
  set_order: string;
  is_template: number;
  setList: WorkoutSet[];
  setListText?: ReactNode;
  isExpanded?: boolean;
};

export type MultisetTypeMap = {
  [key: number]: {
    text: string;
  };
};

export type UseSetTrackingInputsReturnType = {
  isSetTrackingValuesInvalid: boolean;
  setInputsValidityMap: SetTrackingValuesValidity;
  setTrackingValuesInput: SetTrackingValuesInput;
  setSetTrackingValuesInput: React.Dispatch<
    React.SetStateAction<SetTrackingValuesInput>
  >;
  setIsTimeInputInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  setTrackingValuesInputStrings: (set: WorkoutSet) => void;
};

export type UseExerciseListReturnType = {
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredExercises: Exercise[];
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  getExercises: () => Promise<void>;
  isExercisesLoading: boolean;
};

export type UseMultisetActionsReturnType = {
  isSelectingExercise: boolean;
  setIsSelectingExercise: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingSet: boolean;
  setIsEditingSet: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMultisetExercise: Exercise;
  setSelectedMultisetExercise: React.Dispatch<React.SetStateAction<Exercise>>;
  handleMultisetSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    multiset: Multiset
  ) => void;
};
