import React, { ReactNode } from "react";
import { CalendarDate, useDisclosure } from "@nextui-org/react";

export type Routine = {
  id: number;
  name: string;
  note: string | null;
  is_schedule_weekly: number;
  num_days_in_schedule: number;
  custom_schedule_start_date: string | null;
  workoutTemplateIds?: string;
  workoutTemplateIdList?: number[];
  workoutTemplateIdSet?: Set<number>;
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
  default_plate_collection_id: number;
  workout_ratings_order: string;
  show_secondary_exercise_groups: number;
  automatically_update_active_measurements: number;
  default_num_new_sets: string;
  shown_time_period_properties: string;
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
  default_plate_collection_id?: number;
  workout_ratings_order?: string;
  show_secondary_exercise_groups?: number;
  automatically_update_active_measurements?: number;
  default_num_new_sets?: string;
  shown_time_period_properties?: string;
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
  exerciseIdList?: string;
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
    | "plate-collection";
  showLabel?: boolean;
  isSmall?: boolean;
  isSetEdited?: boolean;
  setIsSetEdited?: React.Dispatch<React.SetStateAction<boolean>>;
  setPlateCollection?: React.Dispatch<React.SetStateAction<PlateCollection>>;
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
  workoutTemplate?: WorkoutTemplate;
  hasInvalidWorkoutTemplate?: boolean;
  routine?: Routine;
  hasInvalidRoutine?: boolean;
  exerciseIdList?: string;
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
  exerciseIdSet?: Set<number>;
  exerciseGroupSetPrimary?: Set<string>;
  exerciseGroupSetSecondary?: Set<string>;
};

export type MultisetTypeMap = Map<number, string>;

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

export type ExerciseMap = Map<number, Exercise>;

export type UseExerciseListReturnType = {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  getExercises: () => Promise<void>;
  toggleFavorite: (exercises: Exercise) => void;
  handleSortOptionSelection: (key: string) => void;
  sortCategory: ExerciseSortCategory;
  exerciseGroupList: string[];
  sortExercisesByActiveCategory: (exerciseList: Exercise[]) => void;
  includeSecondaryGroups: boolean;
  setIncludeSecondaryGroups: React.Dispatch<React.SetStateAction<boolean>>;
  isExerciseListLoaded: React.MutableRefObject<boolean>;
  exerciseMap: React.MutableRefObject<ExerciseMap>;
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
  removeFilter: (key: string) => void;
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
  handleSortOptionSelection: (key: string) => void;
  filterWorkoutListModal: UseDisclosureReturnType;
  handleOpenFilterButton: () => void;
  routineList: UseRoutineListReturnType;
  listFilters: UseListFiltersReturnType;
  workoutTemplateList: UseWorkoutTemplateListReturnType;
  isWorkoutListLoaded: React.MutableRefObject<boolean>;
};

export type UseListFiltersReturnType = {
  handleFilterSaveButton: (
    locale: string,
    activeModal: UseDisclosureReturnType
  ) => void;
  filterMap: Map<ListFilterMapKey, string>;
  removeFilter: (key: string) => void;
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
  filterWeightRangeUnit: string;
  setFilterWeightRangeUnit: React.Dispatch<React.SetStateAction<string>>;
  filterMeasurements: Set<string>;
  setFilterMeasurements: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterMeasurementTypes: Set<string>;
  setFilterMeasurementTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
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
  filterScheduleTypes: Set<string>;
  setFilterScheduleTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterNumScheduleDays: NumberRange;
  setFilterNumScheduleDays: React.Dispatch<React.SetStateAction<NumberRange>>;
  filterWeightUnits: Set<string>;
  setFilterWeightUnits: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterDistanceRange: NumberRange;
  setFilterDistanceRange: React.Dispatch<React.SetStateAction<NumberRange>>;
  filterDistanceRangeUnit: string;
  setFilterDistanceRangeUnit: React.Dispatch<React.SetStateAction<string>>;
  filterDistanceUnits: Set<string>;
  setFilterDistanceUnits: React.Dispatch<React.SetStateAction<Set<string>>>;
  multisetTypeMap: MultisetTypeMap;
  filterMultisetTypes: Set<string>;
  setFilterMultisetTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterMinDate: CalendarDate | null;
  setFilterMinDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  filterMaxDate: CalendarDate | null;
  setFilterMaxDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  isMaxDateBeforeMinDate: boolean;
};

export type ListFilterMapKey =
  | "min-date"
  | "max-date"
  | "weekdays"
  | "routines"
  | "exercises"
  | "exercise-groups"
  | "weight"
  | "measurements"
  | "measurement-types"
  | "workout-templates"
  | "schedule-type"
  | "num-schedule-days"
  | "weight-units"
  | "distance"
  | "distance-units"
  | "multiset-types";

export type TimePeriodListFilterMapKey =
  | "min-date-start"
  | "max-date-start"
  | "min-date-end"
  | "max-date-end"
  | "min-duration"
  | "max-duration"
  | "caloric-intake"
  | "injury"
  | "status";

export type UseWorkoutTemplateListReturnType = {
  workoutTemplateListModal: UseDisclosureReturnType;
  workoutTemplates: WorkoutTemplate[];
  setWorkoutTemplates: React.Dispatch<React.SetStateAction<WorkoutTemplate[]>>;
  handleOpenWorkoutTemplateListModal: () => void;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredWorkoutTemplates: WorkoutTemplate[];
  handleSortOptionSelection: (key: string) => void;
  sortCategory: WorkoutTemplateSortCategory;
  filterWorkoutTemplateListModal: UseDisclosureReturnType;
  handleOpenFilterButton: () => void;
  listFilters: UseListFiltersReturnType;
  workoutTemplateMap: React.MutableRefObject<WorkoutTemplateMap>;
  isWorkoutTemplateListLoaded: React.MutableRefObject<boolean>;
  getWorkoutTemplates: () => Promise<void>;
  sortWorkoutTemplatesByActiveCategory: (
    workoutTemplateList: WorkoutTemplate[]
  ) => void;
};

export type PresetsType = "equipment" | "distance";

export type EquipmentWeightSortCategory =
  | "favorite"
  | "name"
  | "weight-desc"
  | "weight-asc"
  | "plate-col";

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
    defaultPlateCollectionId?: number
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
  isEquipmentWeightListLoaded: React.MutableRefObject<boolean>;
  isDistanceListLoaded: React.MutableRefObject<boolean>;
  sortEquipmentWeightByActiveCategory: (
    equipmentWeightList: EquipmentWeight[]
  ) => void;
  sortDistancesByActiveCategory: (distanceList: Distance[]) => void;
  plateCollections: PlateCollection[];
  setPlateCollections: React.Dispatch<React.SetStateAction<PlateCollection[]>>;
  operatingPlateCollection: PlateCollection;
  setOperatingPlateCollection: React.Dispatch<
    React.SetStateAction<PlateCollection>
  >;
  filteredPlateCollections: PlateCollection[];
  filterQueryPlateCollection: string;
  setFilterQueryPlateCollection: React.Dispatch<React.SetStateAction<string>>;
  updateAvailablePlatesMapKeys: (equipmentWeight?: EquipmentWeight) => void;
  otherUnitPlateCollection: PlateCollection;
  setOtherUnitPlateCollection: React.Dispatch<
    React.SetStateAction<PlateCollection>
  >;
  defaultPlateCollection: PlateCollection;
  updateAvailablePlatesMapValue: (
    equipmentWeight: EquipmentWeight,
    newValue: number
  ) => void;
  isDefaultPlateCollectionInvalid: boolean;
  setIsDefaultPlateCollectionInvalid: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  listFilters: UseListFiltersReturnType;
  filterPresetsListModal: UseDisclosureReturnType;
  presetsTypeString: string;
  handleOpenFilterButton: () => Promise<void>;
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

export type RoutineSortCategory =
  | "name"
  | "num-workouts-asc"
  | "num-workouts-desc"
  | "num-days-asc"
  | "num-days-desc";

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

export type PlateCollection = {
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

export type PlateCollectionPage = "base" | "equipment-list";

export type UsePlateCollectionModalReturnType = {
  plateCalculatorPage: PlateCollectionPage;
  setPlateCalculatorPage: React.Dispatch<
    React.SetStateAction<PlateCollectionPage>
  >;
  plateCollectionModal: UseDisclosureReturnType;
  resetAndOpenPlateCollectionModal: () => void;
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
  routineMap: React.MutableRefObject<RoutineMap>;
  isRoutineListLoaded: React.MutableRefObject<boolean>;
  sortCategory: RoutineSortCategory;
  handleSortOptionSelection: (key: string) => void;
  getRoutines: () => Promise<void>;
  listFilters: UseListFiltersReturnType;
  filterRoutineListModal: UseDisclosureReturnType;
  handleOpenFilterButton: () => Promise<void>;
  sortRoutinesByActiveCategory: (routineList: Routine[]) => void;
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
  measurementMap: React.MutableRefObject<MeasurementMap>;
  createMeasurement: (newMeasurement: Measurement) => Promise<number>;
  listFilters: UseListFiltersReturnType;
};

export type UseMeasurementsInputsReturnType = {
  invalidMeasurementInputs: Set<number>;
  areActiveMeasurementsValid: boolean;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
};

export type WorkoutTemplateMap = Map<number, WorkoutTemplate>;

export type MultisetModalPage =
  | "base"
  | "multiset-list"
  | "exercise-list"
  | "edit-set";

export type MultisetOperationType =
  | ""
  | "change-exercise"
  | "reassign-exercise";

export type UseMultisetActionsReturnType = {
  multisets: Multiset[];
  setMultisets: React.Dispatch<React.SetStateAction<Multiset[]>>;
  modalPage: MultisetModalPage;
  setModalPage: React.Dispatch<React.SetStateAction<MultisetModalPage>>;
  selectedMultisetExercise: Exercise;
  setSelectedMultisetExercise: React.Dispatch<React.SetStateAction<Exercise>>;
  handleMultisetSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    multiset: Multiset,
    modalIsOpen: boolean,
    index: number
  ) => void;
  multisetSetOperationType: MultisetOperationType;
  setMultisetSetOperationType: React.Dispatch<
    React.SetStateAction<MultisetOperationType>
  >;
  changeExerciseAndSave: (exercise: Exercise) => Promise<{
    success: boolean;
    updatedMultiset: Multiset | undefined;
    updatedMultisets: Multiset[] | undefined;
  }>;
  reassignExercise: (exercise: Exercise) => Promise<boolean>;
  closeMultisetModal: () => void;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredMultisets: Multiset[];
  multisetTypeMap: MultisetTypeMap;
  newMultisetSetIndex: number;
  setNewMultisetSetIndex: React.Dispatch<React.SetStateAction<number>>;
  newExerciseList: Exercise[];
  setNewExerciseList: React.Dispatch<React.SetStateAction<Exercise[]>>;
  clearMultiset: (
    newModalPage?: MultisetModalPage,
    newOperatingMultiset?: Multiset
  ) => void;
  calledOutsideModal: boolean;
  updateExerciseInOperatingSet: (exercise: Exercise) => void;
  undoOperatingMultisetChanges: () => void;
  setUneditedMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  setsToDelete: Set<number>;
  updateOperatingSet: () => Promise<void>;
  setCalledOutsideModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleChangeExercise: (
    set: WorkoutSet,
    multiset: Multiset,
    modalIsOpen: boolean,
    operationType: "change-exercise" | "reassign-exercise"
  ) => void;
  multisetModal: UseDisclosureReturnType;
  listFilters: UseListFiltersReturnType;
  filterMultisetsModal: UseDisclosureReturnType;
  handleOpenFilterButton: () => void;
  isMultisetListLoaded: React.MutableRefObject<boolean>;
};

export type TimePeriod = {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  note: string | null;
  caloric_intake: string | null;
  injury: string | null;
  formattedStartDate?: string | null;
  formattedEndDate?: string | null;
  isOngoing?: boolean;
  numDaysBetweenDates?: number;
};

export type UseTimePeriodInputsReturnType = {
  isTimePeriodValid: boolean;
  isTimePeriodNameValid: boolean;
  isStartDateValid: boolean;
  isEndDateValid: boolean;
  startDate: CalendarDate | null;
  setStartDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  endDate: CalendarDate | null;
  setEndDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  startDateString: string | null;
  endDateString: string | null;
};

export type UseTimePeriodListReturnType = {
  timePeriods: TimePeriod[];
  setTimePeriods: React.Dispatch<React.SetStateAction<TimePeriod[]>>;
  filteredTimePeriods: TimePeriod[];
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  isTimePeriodListLoaded: React.MutableRefObject<boolean>;
  getTimePeriods: (locale: string) => Promise<void>;
  sortCategory: TimePeriodSortCategory;
  handleSortOptionSelection: (key: string) => void;
  sortTimePeriodByActiveCategory: (timePeriodList: TimePeriod[]) => void;
  handleOpenFilterButton: () => Promise<void>;
  filterTimePeriodListModal: UseDisclosureReturnType;
  timePeriodListFilters: UseTimePeriodListFiltersReturnType;
};

export type ShownPropertiesTargetType = "workout" | "time-period";

export type TimePeriodSortCategory =
  | "name"
  | "ongoing"
  | "start-date-asc"
  | "start-date-desc"
  | "end-date-asc"
  | "end-date-desc"
  | "length-asc"
  | "length-desc";

export type UseTimePeriodListFiltersReturnType = {
  filterMap: Map<TimePeriodListFilterMapKey, string>;
  filterMinStartDate: CalendarDate | null;
  setFilterMinStartDate: React.Dispatch<
    React.SetStateAction<CalendarDate | null>
  >;
  filterMaxStartDate: CalendarDate | null;
  setFilterMaxStartDate: React.Dispatch<
    React.SetStateAction<CalendarDate | null>
  >;
  filterMinEndDate: CalendarDate | null;
  setFilterMinEndDate: React.Dispatch<
    React.SetStateAction<CalendarDate | null>
  >;
  filterMaxEndDate: CalendarDate | null;
  setFilterMaxEndDate: React.Dispatch<
    React.SetStateAction<CalendarDate | null>
  >;
  filterHasInjury: Set<string>;
  setFilterHasInjury: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterCaloricIntakeTypes: Set<string>;
  setFilterCaloricIntakeTypes: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  handleFilterSaveButton: (
    locale: string,
    activeModal: UseDisclosureReturnType
  ) => void;
  removeFilter: (key: string) => void;
  resetFilter: () => void;
  showResetFilterButton: boolean;
  prefixMap: Map<TimePeriodListFilterMapKey, string>;
  filterMinDuration: number | null;
  setFilterMinDuration: React.Dispatch<React.SetStateAction<number | null>>;
  filterMaxDuration: number | null;
  setFilterMaxDuration: React.Dispatch<React.SetStateAction<number | null>>;
  isMaxDateBeforeMinDateStart: boolean;
  isMaxDateBeforeMinDateEnd: boolean;
  filterStatus: Set<string>;
  setFilterStatus: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export type UseFilterMinAndMaxValueInputsReturnType = {
  minInput: string;
  setMinInput: React.Dispatch<React.SetStateAction<string>>;
  maxInput: string;
  setMaxInput: React.Dispatch<React.SetStateAction<string>>;
  isMinInputInvalid: boolean;
  isMaxInputInvalid: boolean;
  isMaxValueBelowMinValue: boolean;
};
