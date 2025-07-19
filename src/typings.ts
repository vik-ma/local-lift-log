import React, { ReactNode } from "react";
import { CalendarDate, useDisclosure } from "@heroui/react";
import { Store } from "@tauri-apps/plugin-store";

export type Routine = {
  id: number;
  name: string;
  note: string | null;
  schedule_type: number;
  num_days_in_schedule: number;
  start_day: number;
  workout_template_order: string | null;
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
  show_secondary_exercise_groups: number;
  automatically_update_active_measurements: number;
  default_num_new_sets: string;
  shown_time_period_properties: string;
  default_diet_log_day_is_yesterday: number;
  show_warmups_in_exercise_details: number;
  show_multisets_in_exercise_details: number;
  show_pace_in_exercise_details: number;
  show_set_comments_in_exercise_details: number;
  show_workout_comments_in_exercise_details: number;
  never_show_delete_modal: number;
  body_fat_calculation_settings: string;
  show_get_latest_body_weight_button: number;
  show_outdated_body_weight_message: number;
};

export type Exercise = {
  id: number;
  name: string;
  exercise_group_set_string_primary: string;
  exercise_group_map_string_secondary: string | null;
  note: string | null;
  is_favorite: number;
  calculation_string: string | null;
  chart_load_exercise_options: string;
  chart_load_exercise_options_categories: string;
  exerciseGroupStringSetPrimary?: Set<string>;
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

export type NoDayRoutineScheduleItem = {
  id: number;
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
  pace?: number;
  paceUnit?: string;
  workout_comment?: string;
  addCalculationTrigger?: number;
  updateSetTrigger?: number;
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

export type UpdateUserSettingFunction = <K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K]
) => Promise<boolean>;

export type UnitCategory =
  | "Weight"
  | "Distance"
  | "Speed"
  | "Pace"
  | "Circumference";

export type UnitDropdownProps = {
  value: string;
  targetType:
    | "set"
    | "settings"
    | "state"
    | "equipment"
    | "distance"
    | "set-user-weight-unit"
    | "plate-collection"
    | "chart";
  setSet?: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  updateUserSetting?: UpdateUserSettingFunction;
  setState?: React.Dispatch<React.SetStateAction<string>>;
  setEquipmentWeight?: React.Dispatch<React.SetStateAction<EquipmentWeight>>;
  setDistance?: React.Dispatch<React.SetStateAction<Distance>>;
  showLabel?: boolean;
  isSmall?: boolean;
  isSetEdited?: boolean;
  setIsSetEdited?: React.Dispatch<React.SetStateAction<boolean>>;
  setPlateCollection?: React.Dispatch<React.SetStateAction<PlateCollection>>;
  switchWeightUnit?: () => void;
  showBigLabel?: boolean;
  customLabel?: string;
  changeUnitInChart?: (newUnit: string, unitCategory: UnitCategory) => void;
  customWidthString?: string;
};

export type SettingsDropdownProps = {
  value: string;
  targetType: "settings" | "state";
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  updateUserSetting?: UpdateUserSettingFunction;
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
  comment: string | null;
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
  numBodyMeasurementsEntries?: number;
};

export type MeasurementMap = Map<string, Measurement>;

export type BodyMeasurementsValues = {
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
  assignSetTrackingValuesInputs: (set: WorkoutSet) => void;
  isSetEdited: boolean;
  setIsSetEdited: React.Dispatch<React.SetStateAction<boolean>>;
  isValuesAccordionExpanded: boolean;
  setIsValuesAccordionExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  uneditedSet: WorkoutSet | undefined;
  setUneditedSet: React.Dispatch<React.SetStateAction<WorkoutSet | undefined>>;
  setNoteInput: string;
  setSetNoteInput: React.Dispatch<React.SetStateAction<string>>;
  handleSetNoteInputChange: (value: string) => void;
  clearSetInputValues: () => void;
  timeInSeconds: number;
  setTimeInSeconds: React.Dispatch<React.SetStateAction<number>>;
  areInputsEmpty: boolean;
};

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
  isExerciseListLoaded: React.RefObject<boolean>;
  exerciseMap: React.RefObject<ExerciseMap>;
  exerciseGroupDictionary: ExerciseGroupMap;
};

export type UseFilterExerciseListReturnType = {
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredExercises: Exercise[];
  filterExerciseGroups: string[];
  setFilterExerciseGroups: React.Dispatch<React.SetStateAction<string[]>>;
  exerciseGroupModal: UseDisclosureReturnType;
  filterMap: Map<ListFilterMapKey, string>;
  removeFilter: (key: string) => void;
  prefixMap: Map<ListFilterMapKey, string>;
  handleFilterSaveButton: (activeModal: UseDisclosureReturnType) => void;
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
  | "edit"
  | "delete"
  | "edit-timestamp";

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
  isWorkoutListLoaded: React.RefObject<boolean>;
  workoutListHasEmptyWorkouts: React.RefObject<boolean>;
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
  filterMinWeight: number | null;
  setFilterMinWeight: React.Dispatch<React.SetStateAction<number | null>>;
  filterMaxWeight: number | null;
  setFilterMaxWeight: React.Dispatch<React.SetStateAction<number | null>>;
  filterMinDistance: number | null;
  setFilterMinDistance: React.Dispatch<React.SetStateAction<number | null>>;
  filterMaxDistance: number | null;
  setFilterMaxDistance: React.Dispatch<React.SetStateAction<number | null>>;
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
  filterMinNumScheduleDays: number | null;
  setFilterMinNumScheduleDays: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  filterMaxNumScheduleDays: number | null;
  setFilterMaxNumScheduleDays: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  filterWeightUnits: Set<string>;
  setFilterWeightUnits: React.Dispatch<React.SetStateAction<Set<string>>>;
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
  filterMinAndMaxValueInputs: UseFilterMinAndMaxValueInputsReturnType;
  includeNullInMaxValues: boolean;
  setIncludeNullInMaxValues: React.Dispatch<React.SetStateAction<boolean>>;
  filterMinBodyFatPercentage: number | null;
  setFilterMinBodyFatPercentage: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  filterMaxBodyFatPercentage: number | null;
  setFilterMaxBodyFatPercentage: React.Dispatch<
    React.SetStateAction<number | null>
  >;
};

export type ListFilterMapKey =
  | "min-date"
  | "max-date"
  | "weekdays"
  | "routines"
  | "exercises"
  | "exercise-groups"
  | "min-weight"
  | "max-weight"
  | "measurements"
  | "measurement-types"
  | "workout-templates"
  | "schedule-type"
  | "min-num-schedule-days"
  | "max-num-schedule-days"
  | "weight-units"
  | "min-distance"
  | "max-distance"
  | "distance-units"
  | "multiset-types"
  | "min-bf"
  | "max-bf";

export type TimePeriodListFilterMapKey =
  | "min-date-start"
  | "max-date-start"
  | "min-date-end"
  | "max-date-end"
  | "min-duration"
  | "max-duration"
  | "diet-phase"
  | "injury"
  | "status";

export type DietLogListFilterMapKey =
  | "min-date"
  | "max-date"
  | "weekdays"
  | "min-calories"
  | "max-calories"
  | "min-fat"
  | "max-fat"
  | "min-carbs"
  | "max-carbs"
  | "min-protein"
  | "max-protein";

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
  workoutTemplateMap: React.RefObject<WorkoutTemplateMap>;
  isWorkoutTemplateListLoaded: React.RefObject<boolean>;
  getWorkoutTemplates: () => Promise<void>;
  sortWorkoutTemplatesByActiveCategory: (
    workoutTemplateList: WorkoutTemplate[]
  ) => void;
};

export type PresetsType = "equipment" | "distance";

export type UsePresetsListReturnType = {
  equipmentWeights: EquipmentWeight[];
  setEquipmentWeights: React.Dispatch<React.SetStateAction<EquipmentWeight[]>>;
  distances: Distance[];
  setDistances: React.Dispatch<React.SetStateAction<Distance[]>>;
  getEquipmentWeights: (
    category: EquipmentWeightSortCategory,
    defaultPlateCollectionId?: number
  ) => Promise<void>;
  getDistances: (category: DistanceSortCategory) => Promise<void>;
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
  isEquipmentWeightListLoaded: React.RefObject<boolean>;
  isDistanceListLoaded: React.RefObject<boolean>;
  sortEquipmentWeightsByActiveCategory: (
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
    userSettings: UserSettings,
    sortCategory: EquipmentWeightSortCategory | DistanceSortCategory
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

export type SumCalculatorPage = "base" | "list" | "calc";

export type PlateCalculatorPage = "base" | "equipment-list" | "plate-calc-list";

export type OperationTypeSumCalc = "add-preset" | "change-preset";

export type OperationTypePlateCalc = "set-handle" | "show-list";

export type AvailablePlatesMap = Map<EquipmentWeight, number>;

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
  routineMap: React.RefObject<RoutineMap>;
  isRoutineListLoaded: React.RefObject<boolean>;
  sortCategory: RoutineSortCategory;
  handleSortOptionSelection: (key: string) => void;
  getRoutines: () => Promise<void>;
  listFilters: UseListFiltersReturnType;
  filterRoutineListModal: UseDisclosureReturnType;
  handleOpenFilterButton: () => Promise<void>;
  sortRoutinesByActiveCategory: (routineList: Routine[]) => void;
};

export type UseMeasurementListReturnType = {
  measurements: Measurement[];
  setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  isMeasurementListLoaded: React.RefObject<boolean>;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredMeasurements: Measurement[];
  toggleFavorite: (measurement: Measurement) => Promise<void>;
  sortCategory: MeasurementSortCategory;
  handleSortOptionSelection: (key: string) => void;
  sortMeasurementsByActiveCategory: (measurements: Measurement[]) => void;
  activeMeasurementSet: Set<number>;
  setActiveMeasurementSet: React.Dispatch<React.SetStateAction<Set<number>>>;
  measurementMap: React.RefObject<MeasurementMap>;
  createMeasurement: (newMeasurement: Measurement) => Promise<number>;
  listFilters: UseListFiltersReturnType;
  getMeasurements: (activeMeasurements?: Set<number>) => Promise<void>;
};

export type WorkoutTemplateMap = Map<number, WorkoutTemplate>;

export type MultisetModalPage =
  | "base"
  | "multiset-list"
  | "exercise-list"
  | "edit-set";

export type MultisetOperationType =
  | "add"
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
  updateOperatingSet: (updatedSet: WorkoutSet) => Promise<void>;
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
  isMultisetListLoaded: React.RefObject<boolean>;
};

export type TimePeriod = {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  note: string | null;
  diet_phase: string | null;
  injury: string | null;
  formattedStartDate?: string | null;
  formattedEndDate?: string | null;
  isOngoing?: boolean;
  numDaysBetweenDates?: number;
};

export type UseTimePeriodListReturnType = {
  timePeriods: TimePeriod[];
  setTimePeriods: React.Dispatch<React.SetStateAction<TimePeriod[]>>;
  filteredTimePeriods: TimePeriod[];
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  isTimePeriodListLoaded: React.RefObject<boolean>;
  getTimePeriods: (
    locale: string,
    category: TimePeriodSortCategory
  ) => Promise<void>;
  sortCategory: TimePeriodSortCategory;
  handleSortOptionSelection: (key: string) => void;
  sortTimePeriodsByActiveCategory: (timePeriodList: TimePeriod[]) => void;
  filterTimePeriodListModal: UseDisclosureReturnType;
  timePeriodListFilters: UseTimePeriodListFiltersReturnType;
  selectedTimePeriodProperties: Set<string>;
  setSelectedTimePeriodProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
};

export type ShownPropertiesTargetType = "workout" | "time-period";

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
  filterDietPhaseTypes: Set<string>;
  setFilterDietPhaseTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
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
  filterMinAndMaxValueInputs: UseFilterMinAndMaxValueInputsReturnType;
};

export type UseFilterMinAndMaxValueInputsArgs = {
  minValue?: number;
  maxValue?: number;
  isIntegerOnly?: boolean;
};

export type UseFilterMinAndMaxValueInputsReturnType = {
  minInput: string;
  setMinInput: React.Dispatch<React.SetStateAction<string>>;
  maxInput: string;
  setMaxInput: React.Dispatch<React.SetStateAction<string>>;
  isMinInputInvalid: boolean;
  isMaxInputInvalid: boolean;
  isMaxValueBelowMinValue: boolean;
  resetInputs: () => void;
  resetMinInput: () => void;
  resetMaxInput: () => void;
  isFilterInvalid: boolean;
};

export type DietLog = {
  id: number;
  date: string;
  calories: number;
  fat: number | null;
  carbs: number | null;
  protein: number | null;
  comment: string | null;
  formattedDate?: string;
  isExpanded?: boolean;
  disableExpansion?: boolean;
};

export type DietLogDateEntryType = "recent" | "custom" | "range";

export type DietLogMap = Map<string, DietLog>;

export type UseDietLogListReturnType = {
  dietLogs: DietLog[];
  setDietLogs: React.Dispatch<React.SetStateAction<DietLog[]>>;
  dietLogMap: DietLogMap;
  isDietLogListLoaded: React.RefObject<boolean>;
  sortCategory: DietLogSortCategory;
  sortDietLogsByActiveCategory: (dietLogList: DietLog[]) => void;
  handleSortOptionSelection: (key: string) => void;
  addDietLog: (dietLog: DietLog) => Promise<DietLog | undefined>;
  updateDietLog: (dietLog: DietLog) => Promise<DietLog | undefined>;
  deleteDietLog: (dietLog: DietLog) => Promise<DietLog | undefined>;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredDietLogs: DietLog[];
  filterDietLogListModal: UseDisclosureReturnType;
  dietLogListFilters: UseDietLogListFiltersReturnType;
  addDietLogEntryRange: (
    startDate: Date,
    endDate: Date,
    overwriteExistingDietLogs: boolean,
    dietLog: DietLog,
    latestDate?: number
  ) => Promise<DietLog | undefined>;
  getDietLogs: (category: DietLogSortCategory) => Promise<void>;
  latestDietLog: DietLog;
  setLatestDietLog: React.Dispatch<React.SetStateAction<DietLog>>;
  defaultDietLog: DietLog;
};

export type UseDietLogListFiltersReturnType = {
  handleFilterSaveButton: (activeModal: UseDisclosureReturnType) => void;
  filterMap: Map<DietLogListFilterMapKey, string>;
  removeFilter: (key: string) => void;
  resetFilter: () => void;
  showResetFilterButton: boolean;
  prefixMap: Map<DietLogListFilterMapKey, string>;
  filterMinDate: CalendarDate | null;
  setFilterMinDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  filterMaxDate: CalendarDate | null;
  setFilterMaxDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  isMaxDateBeforeMinDate: boolean;
  filterWeekdays: Set<string>;
  setFilterWeekdays: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterMinCalories: number | null;
  setFilterMinCalories: React.Dispatch<React.SetStateAction<number | null>>;
  filterMaxCalories: number | null;
  setFilterMaxCalories: React.Dispatch<React.SetStateAction<number | null>>;
  filterMinFat: number | null;
  setFilterMinFat: React.Dispatch<React.SetStateAction<number | null>>;
  filterMaxFat: number | null;
  setFilterMaxFat: React.Dispatch<React.SetStateAction<number | null>>;
  filterMinCarbs: number | null;
  setFilterMinCarbs: React.Dispatch<React.SetStateAction<number | null>>;
  filterMaxCarbs: number | null;
  setFilterMaxCarbs: React.Dispatch<React.SetStateAction<number | null>>;
  filterMinProtein: number | null;
  setFilterMinProtein: React.Dispatch<React.SetStateAction<number | null>>;
  filterMaxProtein: number | null;
  setFilterMaxProtein: React.Dispatch<React.SetStateAction<number | null>>;
  weekdayMap: Map<string, string>;
  filterMinAndMaxValueInputsCalories: UseFilterMinAndMaxValueInputsReturnType;
  filterMinAndMaxValueInputsFat: UseFilterMinAndMaxValueInputsReturnType;
  filterMinAndMaxValueInputsCarbs: UseFilterMinAndMaxValueInputsReturnType;
  filterMinAndMaxValueInputsProtein: UseFilterMinAndMaxValueInputsReturnType;
  includeNullInMaxValuesFat: boolean;
  setIncludeNullInMaxValuesFat: React.Dispatch<React.SetStateAction<boolean>>;
  includeNullInMaxValuesCarbs: boolean;
  setIncludeNullInMaxValuesCarbs: React.Dispatch<React.SetStateAction<boolean>>;
  includeNullInMaxValuesProtein: boolean;
  setIncludeNullInMaxValuesProtein: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

export type FilterMinAndMaxValuesSetStateMap = Map<
  string,
  React.Dispatch<React.SetStateAction<number | null>>
>;

export type RoutineScheduleTypeMap = Map<number, string>;

export type UseDateRangeReturnType = {
  startDate: CalendarDate | null;
  setStartDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  endDate: CalendarDate | null;
  setEndDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  isEndDateBeforeStartDate: boolean;
  isDateRangeInvalid: boolean;
  isStartDateBeforeEpoch: boolean;
  isEndDateBeforeEpoch: boolean;
};

export type ChartDataCategory =
  | undefined
  | "calories"
  | "fat"
  | "carbs"
  | "protein"
  | "body_weight"
  | "body_fat_percentage"
  | `measurement_${number}`
  | `exercise_group_${string}`
  | ChartDataExerciseCategory;

export type ChartDataCategoryNoUndefined = Exclude<
  ChartDataCategory,
  undefined
>;

export type ChartDataExerciseCategoryBase =
  | `weight_${"min" | "max" | "avg" | "volume"}`
  | `distance_${"min" | "max" | "avg" | "total"}`
  | `time_${"min" | "max" | "avg" | "total"}`
  | `speed_${"min" | "max" | "avg"}`
  | `pace_${"min" | "max" | "avg"}`
  | `num_sets`
  | `num_reps_${"min" | "max" | "avg" | "total"}`
  | `num_reps_and_partial_reps_${"min" | "max" | "avg" | "total"}`
  | `num_partial_reps_${"min" | "max" | "avg" | "total"}`
  | `set_body_weight`
  | `rir_${"min" | "max" | "avg"}`
  | `rpe_${"min" | "max" | "avg"}`
  | `resistance_level_${"min" | "max" | "avg"}`;

export type ChartDataExerciseCategory =
  | ChartDataExerciseCategoryBase
  | `${ChartDataExerciseCategoryBase}_${number}`;

export type ChartDataUnitCategory =
  | undefined
  | "Calories"
  | "Macros"
  | "Weight"
  | "Body Fat %"
  | "Caliper"
  | "Circumference"
  | "Distance"
  | "Time"
  | "Speed"
  | "Pace"
  | "Number Of Sets"
  | "Number Of Reps"
  | "RIR"
  | "RPE"
  | "Resistance Level";

export type ChartDataUnitCategoryNoUndefined = Exclude<
  ChartDataUnitCategory,
  undefined
>;

export type ChartComment = {
  dataKeys: Set<ChartDataCategory>;
  label: string;
  comment: string;
};

export type ChartReferenceAreaItem = {
  timePeriodId: number;
  x1: string;
  x2: string;
  label: string;
  startDate: string;
  endDate: string | null;
};

export type TimeCompleted = {
  time_completed: string;
};

export type ChartDataItem = {
  date: string;
} & {
  [key in ChartDataCategoryNoUndefined]?: number;
};

export type ExerciseMaxListValue = {
  value: number;
  date: string;
  formattedDate: string;
  id?: number;
  isWarmup?: boolean;
};

export type BodyMeasurements = {
  id: number;
  date: string;
  comment: string | null;
  weight: number;
  weight_unit: string;
  body_fat_percentage: number | null;
  measurement_values: string;
  measurementsText?: string;
  formattedDate?: string;
  isExpanded?: boolean;
  bodyMeasurementsValues?: BodyMeasurementsValues;
  isInvalid?: boolean;
  disableExpansion?: boolean;
};

export type UseBodyMeasurementsSettingsReturnType = {
  weightUnit: string;
  setWeightUnit: React.Dispatch<React.SetStateAction<string>>;
  activeMeasurementsValue: React.RefObject<Measurement[]>;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  getActiveMeasurements: (activeMeasurementsString: string) => void;
  updateActiveTrackingMeasurementOrder: () => void;
  isMale: boolean;
  setIsMale: React.Dispatch<React.SetStateAction<boolean>>;
  ageGroup: string;
  setAgeGroup: React.Dispatch<React.SetStateAction<string>>;
  bodyFatMeasurementList: (Measurement | undefined)[];
  setBodyFatMeasurementList: React.Dispatch<
    React.SetStateAction<(Measurement | undefined)[]>
  >;
  bodyFatCalculationModal: UseDisclosureReturnType;
  loadBodyFatCalculationSettingsString: (
    bodyFatCalculationSettingsString: string,
    measurementMap: MeasurementMap
  ) => void;
  bodyFatMeasurementsMap: Map<number, Measurement>;
  isBodyFatMeasurementListInvalid: boolean;
  saveBodyFatCalculationSettingsString: () => void;
  validBodyFatInputs: React.RefObject<Set<number>>;
};

export type BodyFatCalculationConstants = {
  c: number;
  m: number;
};

export type UserWeight = {
  weight: number;
  weight_unit: string;
  date: string;
  formattedDate: string;
};

export type PresetsOperationType = "add" | "edit" | "delete";

export type DefaultIncrementInputInvalidityMap = {
  weight: boolean;
  distance: boolean;
  resistanceLevel: boolean;
  calculationMultiplier: boolean;
};

export type UseSettingsListReturnType = {
  defaultIncrementInputValues: DefaultIncrementInputs;
  setDefaultIncrementInputValues: React.Dispatch<
    React.SetStateAction<DefaultIncrementInputs>
  >;
  defaultIncrementOriginalValues: DefaultIncrementInputs;
  setDefaultIncrementOriginalValues: React.Dispatch<
    React.SetStateAction<DefaultIncrementInputs>
  >;
  timeInSeconds: number;
  setTimeInSeconds: React.Dispatch<React.SetStateAction<number>>;
};

export type StoreRef = React.RefObject<Store | null>;

export type ExerciseSortCategory = "favorite" | "name" | "num-sets";

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

export type MeasurementSortCategory = "favorite" | "active" | "name";

export type BodyMeasurementSortCategory =
  | "date-asc"
  | "date-desc"
  | "weight-asc"
  | "weight-desc"
  | "bf-asc"
  | "bf-desc";

export type TimePeriodSortCategory =
  | "name"
  | "ongoing"
  | "start-date-asc"
  | "start-date-desc"
  | "end-date-asc"
  | "end-date-desc"
  | "length-asc"
  | "length-desc";

export type DietLogSortCategory =
  | "date-asc"
  | "date-desc"
  | "calories-asc"
  | "calories-desc";

export type ListSortCategory =
  | ExerciseSortCategory
  | WorkoutSortCategory
  | WorkoutTemplateSortCategory
  | RoutineSortCategory
  | EquipmentWeightSortCategory
  | DistanceSortCategory
  | MeasurementSortCategory
  | BodyMeasurementSortCategory
  | TimePeriodSortCategory
  | DietLogSortCategory;

export type ListSortCategoryStoreKey =
  | "exercises"
  | "workouts"
  | "workout-templates"
  | "routines"
  | "equipment-weights"
  | "distances"
  | "measurements"
  | "body-measurements"
  | "time-periods"
  | "diet-logs";
