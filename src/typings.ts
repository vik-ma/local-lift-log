import React, { ReactNode } from "react";
import { CalendarDate, RangeValue, useDisclosure } from "@nextui-org/react";

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
  default_increment_weight: number;
  default_increment_distance: number;
  default_increment_time: number;
  default_increment_resistance_level: number;
  save_calculation_string: number;
  show_calculation_buttons: number;
  default_increment_calculation_multiplier: number;
  default_calculation_tab: string;
  shown_workout_properties: string;
  default_plate_calculation_id: number;
  workout_ratings_order: string;
  show_secondary_exercise_groups: number;
  automatically_update_active_measurements: number;
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
  default_increment_weight?: number;
  default_increment_distance?: number;
  default_increment_time?: number;
  default_increment_resistance_level?: number;
  save_calculation_string?: number;
  default_equipment_weight_id?: number;
  show_calculation_buttons?: number;
  default_increment_calculation_multiplier?: number;
  default_num_handles?: number;
  default_calculation_tab?: string;
  shown_workout_properties?: string;
  default_plate_calculation_id?: number;
  workout_ratings_order?: string;
  show_secondary_exercise_groups?: number;
  automatically_update_active_measurements?: number;
};

export type Exercise = {
  id: number;
  name: string;
  exercise_group_set_string_primary: string;
  exercise_group_set_string_secondary: string | null;
  note: string | null;
  is_favorite: number;
  calculation_string: string | null;
  exerciseGroupStringListPrimary?: string[];
  formattedGroupStringPrimary?: string;
  exerciseGroupStringMapSecondary?: Map<string, string>;
  formattedGroupStringSecondary?: string;
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
  exerciseListString?: string;
  exerciseIdSet?: Set<number>;
  exerciseGroupSetPrimary?: Set<string>;
  exerciseGroupSetSecondary?: Set<string>;
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
  is_tracking_user_weight: number;
  weight_unit: string;
  distance_unit: string;
  multiset_id: number;
  user_weight: number;
  user_weight_unit: string;
  exercise_name?: string;
  set_index?: number;
  hasInvalidExerciseId?: boolean;
  isEditedInMultiset?: boolean;
};

export type GroupedWorkoutSet = {
  id: string;
  exerciseList: Exercise[];
  setList: WorkoutSet[];
  isExpanded: boolean;
  showGroupedSetNote?: boolean;
  isMultiset?: boolean;
  multiset?: Multiset;
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
  targetType:
    | "set"
    | "settings"
    | "state"
    | "equipment"
    | "distance"
    | "set-user-weight-unit"
    | "plate-calculation";
  showLabel?: boolean;
  isSmall?: boolean;
  isSetEdited?: boolean;
  setIsSetEdited?: React.Dispatch<React.SetStateAction<boolean>>;
  setPlateCalculation?: React.Dispatch<React.SetStateAction<PlateCalculation>>;
  switchWeightUnit?: () => void;
};

export type MeasurementDropdownProps = {
  measurement?: Measurement;
  isDisabled?: boolean;
  measurements?: Measurement[];
  setMeasurements?: SetMeasurementsAction;
  setMeasurement?: SetMeasurementAction;
  value?: string;
  setUserSettings?: HTMLSelectElementChange;
  targetType: "modal" | "settings" | "active";
};

export type SetTrackingValuesInput = {
  weight: string;
  reps: string;
  rir: string;
  rpe: string;
  distance: string;
  resistance_level: string;
  partial_reps: string;
  user_weight: string;
};

export type SetTrackingValuesNumbers = {
  weight: number;
  reps: number;
  rir: number;
  rpe: number;
  distance: number;
  resistance_level: number;
  partial_reps: number;
  user_weight: number;
};

export type SetTrackingValuesInvalidity = {
  weight: boolean;
  reps: boolean;
  rir: boolean;
  rpe: boolean;
  distance: boolean;
  resistance_level: boolean;
  partial_reps: boolean;
  user_weight: boolean;
};

export type Workout = {
  id: number;
  workout_template_id: number;
  date: string;
  exercise_order: string;
  note: string | null;
  rating_general: number;
  rating_energy: number;
  rating_injury: number;
  rating_sleep: number;
  rating_calories: number;
  rating_fasting: number;
  rating_time: number;
  rating_stress: number;
  routine_id: number;
  numSets?: number;
  numExercises?: number;
  formattedDate?: string;
  workoutTemplateName?: string | null;
  hasInvalidWorkoutTemplate?: boolean;
  routine?: Routine;
  hasInvalidRoutine?: boolean;
  exerciseListString?: string;
  exerciseIdSet?: Set<number>;
  exerciseGroupSetPrimary?: Set<string>;
  exerciseGroupSetSecondary?: Set<string>;
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
  is_favorite: number;
};

export type Distance = {
  id: number;
  name: string;
  distance: number;
  distance_unit: string;
  is_favorite: number;
};

export type Measurement = {
  id: number;
  name: string;
  default_unit: string;
  measurement_type: string;
  is_favorite: number;
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
  [key: string]: Set<number>;
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
  note: string | null;
  setList: WorkoutSet[];
  setListText?: ReactNode;
  setListTextString?: string;
  isExpanded?: boolean;
  setListIndexCutoffs?: Map<number, number>;
  isEditedInModal?: boolean;
};

export type MultisetTypeMap = {
  [key: number]: {
    text: string;
  };
};

export type UseSetTrackingInputsReturnType = {
  isSetTrackingValuesInvalid: boolean;
  setInputsInvalidityMap: SetTrackingValuesInvalidity;
  setTrackingValuesInput: SetTrackingValuesInput;
  setSetTrackingValuesInput: React.Dispatch<
    React.SetStateAction<SetTrackingValuesInput>
  >;
  isTimeInputInvalid: boolean;
  setIsTimeInputInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  setTrackingValuesInputStrings: (set: WorkoutSet) => void;
  isSetEdited: boolean;
  setIsSetEdited: React.Dispatch<React.SetStateAction<boolean>>;
  uneditedSet: WorkoutSet | undefined;
  setUneditedSet: React.Dispatch<React.SetStateAction<WorkoutSet | undefined>>;
};

export type ExerciseSortCategory = "favorite" | "name" | "num-sets";

export type UseExerciseListReturnType = {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  getExercises: () => Promise<void>;
  toggleFavorite: (exercises: Exercise) => void;
  handleSortOptionSelection: (key: string) => void;
  sortCategory: ExerciseSortCategory;
  setSortCategory: React.Dispatch<React.SetStateAction<ExerciseSortCategory>>;
  exerciseGroupList: string[];
  sortExercisesByActiveCategory: (exerciseList: Exercise[]) => void;
  includeSecondaryGroups: boolean;
  setIncludeSecondaryGroups: React.Dispatch<React.SetStateAction<boolean>>;
  isExerciseListLoaded: React.MutableRefObject<boolean>;
  exerciseMap: Map<number, Exercise>;
  exerciseGroupDictionary: ExerciseGroupMap;
};

export type UseFilterExerciseListReturnType = {
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredExercises: Exercise[];
  shownExerciseGroups: string[];
  setShownExerciseGroups: React.Dispatch<React.SetStateAction<string[]>>;
  exerciseGroupModal: UseDisclosureReturnType;
  areExerciseGroupsFiltered: boolean;
  filterMap: Map<ListFilterMapKey, string>;
  removeFilter: (key: ListFilterMapKey) => void;
  prefixMap: Map<ListFilterMapKey, string>;
};

export type HandleMultisetSetOptionSelectionProps = (
  key: string,
  set: WorkoutSet,
  multiset: Multiset,
  modalIsOpen: boolean,
  index: number
) => void;

export type Identifiable = {
  id: string | number;
};

export type BodyMeasurementsOperationType =
  | "add"
  | "edit-weight"
  | "delete-weight"
  | "edit-measurements"
  | "delete-measurements";

export type DefaultIncrementInputs = {
  weight: string;
  distance: string;
  time: number;
  resistanceLevel: string;
  calculationMultiplier: string;
};

export type DetailHeaderOptionItem = {
  [key: string]: {
    text: string;
    function: () => void;
    className?: string;
  };
};

export type UseDetailsHeaderOptionsMenuReturnType = {
  showNote: boolean;
  setShowNote: React.Dispatch<React.SetStateAction<boolean>>;
  menuItems: DetailHeaderOptionItem;
  handleOptionMenuSelection: (key: string) => void;
};

export type UseDisclosureReturnType = ReturnType<typeof useDisclosure>;

export type UseWorkoutListReturnType = {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  getWorkouts: () => void;
  handleOpenWorkoutListModal: () => void;
  workoutListModal: UseDisclosureReturnType;
  filteredWorkouts: Workout[];
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  sortWorkoutsByDate: (workoutList: Workout[], isAscending: boolean) => void;
  sortCategory: WorkoutSortCategory;
  setSortCategory: React.Dispatch<React.SetStateAction<WorkoutSortCategory>>;
  handleSortOptionSelection: (key: string) => void;
  filterWorkoutListModal: UseDisclosureReturnType;
  handleOpenFilterButton: () => void;
  routineList: UseRoutineListReturnType;
  listFilters: UseListFiltersReturnType;
};

export type UseListFiltersReturnType = {
  handleFilterSaveButton: (
    locale: string,
    activeModal: UseDisclosureReturnType
  ) => void;
  filterDateRange: RangeValue<CalendarDate> | null;
  setFilterDateRange: React.Dispatch<
    React.SetStateAction<RangeValue<CalendarDate> | null>
  >;
  filterMap: Map<ListFilterMapKey, string>;
  removeFilter: (key: ListFilterMapKey) => void;
  resetFilter: () => void;
  showResetFilterButton: boolean;
  filterWeekdays: Set<string>;
  setFilterWeekdays: React.Dispatch<React.SetStateAction<Set<string>>>;
  weekdayMap: Map<string, string>;
  filterRoutines: Set<number>;
  setFilterRoutines: React.Dispatch<React.SetStateAction<Set<number>>>;
  filterExercises: Set<number>;
  setFilterExercises: React.Dispatch<React.SetStateAction<Set<number>>>;
  filterExerciseGroups: string[];
  setFilterExerciseGroups: React.Dispatch<React.SetStateAction<string[]>>;
  prefixMap: Map<ListFilterMapKey, string>;
  filterWeightRange: NumberRange;
  setFilterWeightRange: React.Dispatch<React.SetStateAction<NumberRange>>;
  filterWeightUnit: string;
  setFilterWeightUnit: React.Dispatch<React.SetStateAction<string>>;
  defaultNumberRange: NumberRange;
  filterMeasurements: Set<string>;
  setFilterMeasurements: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterMeasurementTypes: string[];
  setFilterMeasurementTypes: React.Dispatch<React.SetStateAction<string[]>>;
  handleFilterMeasurementTypes: (key: string) => void;
  filterWorkoutTemplates: Set<number>;
  setFilterWorkoutTemplates: React.Dispatch<React.SetStateAction<Set<number>>>;
  filterRoutinesString: string;
  filterExercisesString: string;
  filterExerciseGroupsString: string;
  filterMeasurementsString: string;
  filterWorkoutTemplatesString: string;
  handleClickRoutine: (routine: Routine) => void;
  handleClickExercise: (exercise: Exercise) => void;
  handleClickMeasurement: (measurement: Measurement) => void;
  handleClickWorkoutTemplate: (workoutTemplate: WorkoutTemplate) => void;
};

export type ListFilterMapKey =
  | "dates"
  | "weekdays"
  | "routines"
  | "exercises"
  | "exercise-groups"
  | "weight"
  | "measurements"
  | "measurement-types"
  | "workout-templates";

export type UseWorkoutTemplateListReturnType = {
  workoutTemplatesModal: UseDisclosureReturnType;
  workoutTemplates: WorkoutTemplate[];
  setWorkoutTemplates: React.Dispatch<React.SetStateAction<WorkoutTemplate[]>>;
  handleOpenWorkoutTemplatesModal: () => void;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredWorkoutTemplates: WorkoutTemplate[];
  handleSortOptionSelection: (key: string) => void;
  sortCategory: WorkoutTemplateSortCategory;
  filterWorkoutTemplateListModal: UseDisclosureReturnType;
  handleOpenFilterButton: () => void;
  listFilters: UseListFiltersReturnType;
  workoutTemplateMap: WorkoutTemplateMap;
  isWorkoutTemplateListLoaded: React.MutableRefObject<boolean>;
};

export type PresetsType = "equipment" | "distance";

export type EquipmentWeightSortCategory =
  | "favorite"
  | "name"
  | "weight-desc"
  | "weight-asc"
  | "plate-calc";

export type DistanceSortCategory =
  | "favorite"
  | "name"
  | "distance-desc"
  | "distance-asc";

export type UsePresetsListReturnType = {
  equipmentWeights: EquipmentWeight[];
  setEquipmentWeights: React.Dispatch<React.SetStateAction<EquipmentWeight[]>>;
  distances: Distance[];
  setDistances: React.Dispatch<React.SetStateAction<Distance[]>>;
  getEquipmentWeights: (
    defaultEquipmentHandleId?: number,
    defaultPlateCalculationId?: number
  ) => Promise<void>;
  getDistances: () => Promise<void>;
  presetsType: PresetsType;
  setPresetsType: React.Dispatch<React.SetStateAction<PresetsType>>;
  filterQueryEquipment: string;
  setFilterQueryEquipment: React.Dispatch<React.SetStateAction<string>>;
  filteredEquipmentWeights: EquipmentWeight[];
  filterQueryDistance: string;
  setFilterQueryDistance: React.Dispatch<React.SetStateAction<string>>;
  filteredDistances: Distance[];
  toggleFavoriteEquipmentWeight: (equipmentWeight: EquipmentWeight) => void;
  toggleFavoriteDistance: (distance: Distance) => void;
  sortCategoryEquipment: EquipmentWeightSortCategory;
  sortCategoryDistance: DistanceSortCategory;
  handleSortOptionSelectionEquipment: (key: string) => void;
  handleSortOptionSelectionDistance: (key: string) => void;
  isLoadingEquipment: boolean;
  isLoadingDistance: boolean;
  sortEquipmentWeightByActiveCategory: (
    equipmentWeightList: EquipmentWeight[]
  ) => void;
  sortDistancesByActiveCategory: (distanceList: Distance[]) => void;
  plateCalculations: PlateCalculation[];
  setPlateCalculations: React.Dispatch<
    React.SetStateAction<PlateCalculation[]>
  >;
  operatingPlateCalculation: PlateCalculation;
  setOperatingPlateCalculation: React.Dispatch<
    React.SetStateAction<PlateCalculation>
  >;
  filteredPlateCalculations: PlateCalculation[];
  filterQueryPlateCalculation: string;
  setFilterQueryPlateCalculation: React.Dispatch<React.SetStateAction<string>>;
  updateAvailablePlatesMapKeys: (equipmentWeight: EquipmentWeight) => void;
  otherUnitPlateCalculation: PlateCalculation;
  setOtherUnitPlateCalculation: React.Dispatch<
    React.SetStateAction<PlateCalculation>
  >;
  defaultPlateCalculation: PlateCalculation;
  updateAvailablePlatesMapValue: (
    equipmentWeight: EquipmentWeight,
    newValue: number
  ) => void;
  isDefaultPlateCalculationInvalid: boolean;
  setIsDefaultPlateCalculationInvalid: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

export type CalculationModalTab = "sum" | "plate";

export type UseCalculationModalReturnType = {
  calculationModal: UseDisclosureReturnType;
  calculationModalTab: CalculationModalTab;
  setCalculationModalTab: React.Dispatch<
    React.SetStateAction<CalculationModalTab>
  >;
  calculationString: string | null;
  setCalculationString: React.Dispatch<React.SetStateAction<string | null>>;
  isActiveSet: boolean;
  setIsActiveSet: React.Dispatch<React.SetStateAction<boolean>>;
  calculationExercise: Exercise | undefined;
  setCalculationExercise: React.Dispatch<
    React.SetStateAction<Exercise | undefined>
  >;
  weightUnit: string;
  setWeightUnit: React.Dispatch<React.SetStateAction<string>>;
  distanceUnit: string;
  setDistanceUnit: React.Dispatch<React.SetStateAction<string>>;
  targetWeightInput: string;
  setTargetWeightInput: React.Dispatch<React.SetStateAction<string>>;
  openCalculationModal: (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet,
    presetsList: UsePresetsListReturnType,
    userSettings: UserSettings
  ) => Promise<void>;
};

export type CalculationItemType = "preset" | "calculation" | "number";

export type CalculationListItem = {
  itemType: CalculationItemType;
  label: string;
  value: number;
  unit: string;
  multiplierInput: string;
  multiplier: number;
  isMultiplierInputInvalid: boolean;
  disableDecreaseMultiplierButton: boolean;
  disableIncreaseMultiplierButton: boolean;
  equipmentWeight?: EquipmentWeight;
  distance?: Distance;
};

export type OperatingCalculationItem = {
  calculationItem: CalculationListItem;
  index: number;
};

export type WorkoutSortCategory =
  | "date-asc"
  | "date-desc"
  | "num-sets-asc"
  | "num-sets-desc"
  | "num-exercises-asc"
  | "num-exercises-desc";

export type WorkoutTemplateSortCategory =
  | "name"
  | "date"
  | "num-sets-asc"
  | "num-sets-desc"
  | "num-exercises-asc"
  | "num-exercises-desc";

export type SumCalculatorPage = "base" | "list" | "calc";

export type PlateCalculatorPage = "base" | "equipment-list" | "plate-calc-list";

export type OperationTypeSumCalc = "add-preset" | "change-preset";

export type OperationTypePlateCalc = "set-handle" | "show-list";

export type AvailablePlatesMap = Map<EquipmentWeight, number>;

export type NumberRange = {
  start: number;
  end: number;
  startInput: string;
  endInput: string;
};

export type PlateCalculation = {
  id: number;
  name: string;
  handle_id: number;
  available_plates_string: string;
  num_handles: number;
  weight_unit: string;
  handle?: EquipmentWeight | undefined;
  availablePlatesMap?: AvailablePlatesMap;
  formattedAvailablePlatesString?: string;
  formattedAvailablePlatesMapString?: string;
};

export type AvailablePlates = {
  equipmentWeightId: number;
  numAvailable: number;
};

export type PlateCalculationPage = "base" | "equipment-list";

export type UsePlateCalculationModalReturnType = {
  plateCalculatorPage: PlateCalculationPage;
  setPlateCalculatorPage: React.Dispatch<
    React.SetStateAction<PlateCalculationPage>
  >;
  plateCalculationModal: UseDisclosureReturnType;
  resetAndOpenPlateCalculationModal: () => void;
};

export type RoutineMap = Map<number, Routine>;

export type UseRoutineListReturnType = {
  routines: Routine[];
  setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
  filteredRoutines: Routine[];
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  routineListModal: UseDisclosureReturnType;
  handleOpenRoutineListModal: () => void;
  routineMap: RoutineMap;
  isRoutineListLoaded: React.MutableRefObject<boolean>;
};

export type NumberRangeInvalidityMap = {
  start: boolean;
  end: boolean;
};

export type MeasurementSortCategory = "favorite" | "active" | "name";

export type UseMeasurementListReturnType = {
  measurements: Measurement[];
  setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  isMeasurementListLoaded: React.MutableRefObject<boolean>;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredMeasurements: Measurement[];
  toggleFavorite: (measurement: Measurement) => Promise<void>;
  sortCategory: MeasurementSortCategory;
  handleSortOptionSelection: (key: string) => void;
  sortMeasurementsByActiveCategory: (measurements: Measurement[]) => void;
  activeMeasurementSet: Set<number>;
  setActiveMeasurementSet: React.Dispatch<React.SetStateAction<Set<number>>>;
  measurementMap: MeasurementMap;
  createMeasurement: (newMeasurement: Measurement) => Promise<number>;
  listFilters: UseListFiltersReturnType;
};

export type UseMeasurementsInputsReturnType = {
  invalidMeasurementInputs: Set<number>;
  areActiveMeasurementsValid: boolean;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
};

export type WorkoutTemplateMap = Map<number, WorkoutTemplate>;
