import { useState, useEffect, useMemo } from "react";
import {
  UserSettings,
  DefaultIncrementInputs,
  PlateCollection,
  ChartDataExerciseCategoryBase,
  ChartDataUnitCategory,
} from "../typings";
import {
  GetUserSettings,
  CreateDefaultUserSettings,
  IsStringInvalidNumberOr0,
  ConvertNumberToTwoDecimals,
  CreateShownPropertiesSet,
  GetValidatedUserSettingsUnits,
  ValidateUserSetting,
  ValidLoadExerciseOptionsCategories,
  FillInLoadExerciseOptions,
} from "../helpers";
import {
  Switch,
  Select,
  SelectItem,
  Button,
  useDisclosure,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  LoadingSpinner,
  WeightUnitDropdown,
  DistanceUnitDropdown,
  MeasurementUnitDropdown,
  LocaleDropdown,
  ClockStyleDropdown,
  TimeInputBehaviorDropdown,
  CreateDefaultSettingsModal,
  TimeValueInput,
  WorkoutPropertyDropdown,
  PlateCollectionModalList,
  NumSetsDropdown,
  TimePeriodPropertyDropdown,
  DietLogDayDropdown,
  LoadExerciseOptionsModal,
} from "../components";
import toast from "react-hot-toast";
import Database from "tauri-plugin-sql-api";
import {
  useDefaultChartMapsAndConfig,
  useLoadExerciseOptionsMap,
  usePresetsList,
  useTimeInputMap,
} from "../hooks";
import { Reorder } from "framer-motion";
import { ReorderIcon } from "../assets";

type DefaultIncrementInputInvalidityMap = {
  weight: boolean;
  distance: boolean;
  resistanceLevel: boolean;
  calculationMultiplier: boolean;
};

type WorkoutRatingValues = { label: string; num: number };

type SpecificSettingModalPage = "default-plate-calc" | "workout-rating-order";

export default function Settings() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [selectedWorkoutProperties, setSelectedWorkoutProperties] = useState<
    Set<string>
  >(new Set());
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);
  const [specificSettingModalPage, setSpecificSettingModalPage] =
    useState<SpecificSettingModalPage>("default-plate-calc");
  const [selectedTimePeriodProperties, setSelectedTimePeriodProperties] =
    useState<Set<string>>(new Set());
  const [loadExerciseOptions, setLoadExerciseOptions] = useState<
    Set<ChartDataExerciseCategoryBase>
  >(new Set());
  const [
    loadExerciseOptionsUnitCategoryPrimary,
    setLoadExerciseOptionsUnitCategoryPrimary,
  ] = useState<ChartDataUnitCategory>();
  const [
    loadExerciseOptionsUnitCategorySecondary,
    setLoadExerciseOptionsUnitCategorySecondary,
  ] = useState<ChartDataUnitCategory>();
  const [
    loadExerciseOptionsUnitCategoriesPrimary,
    setLoadExerciseOptionsUnitCategoriesPrimary,
  ] = useState<Set<ChartDataUnitCategory>>(new Set());
  const [
    loadExerciseOptionsUnitCategoriesSecondary,
    setLoadExerciseOptionsUnitCategoriesSecondary,
  ] = useState<ChartDataUnitCategory[]>([]);

  const createDefaultSettingsModal = useDisclosure();
  const specificSettingModal = useDisclosure();
  const loadExerciseOptionsModal = useDisclosure();

  const emptyDefaultIncrementValues: DefaultIncrementInputs = useMemo(() => {
    return {
      weight: "",
      distance: "",
      time: 0,
      resistanceLevel: "",
      calculationMultiplier: "",
    };
  }, []);

  const [workoutRatingsList, setWorkoutRatingsList] = useState<
    WorkoutRatingValues[]
  >([]);

  const presetsList = usePresetsList(false, false);

  const { setFilterWeightRangeUnit, setFilterDistanceRangeUnit } =
    presetsList.listFilters;

  const [defaultIncrementInputValues, setDefaultIncrementInputValues] =
    useState<DefaultIncrementInputs>(emptyDefaultIncrementValues);

  const [defaultIncrementOriginalValues, setDefaultIncrementOriginalValues] =
    useState<DefaultIncrementInputs>(emptyDefaultIncrementValues);

  const defaultIncrementInputsInvalidityMap =
    useMemo((): DefaultIncrementInputInvalidityMap => {
      const values: DefaultIncrementInputInvalidityMap = {
        weight: IsStringInvalidNumberOr0(defaultIncrementInputValues.weight),
        distance: IsStringInvalidNumberOr0(
          defaultIncrementInputValues.distance
        ),
        resistanceLevel: IsStringInvalidNumberOr0(
          defaultIncrementInputValues.resistanceLevel
        ),
        calculationMultiplier: IsStringInvalidNumberOr0(
          defaultIncrementInputValues.calculationMultiplier
        ),
      };
      return values;
    }, [defaultIncrementInputValues]);

  const timeInputMap = useTimeInputMap();

  const loadExerciseOptionsMap = useLoadExerciseOptionsMap();

  const { defaultChartDataUnitCategoryMap } = useDefaultChartMapsAndConfig();

  const validLoadExerciseOptionsCategories =
    ValidLoadExerciseOptionsCategories();

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      userSettings.default_unit_weight = validUnits.weightUnit;
      userSettings.default_unit_distance = validUnits.distanceUnit;
      userSettings.default_unit_measurement = validUnits.measurementUnit;

      const defaultIncrementValues: DefaultIncrementInputs = {
        weight: userSettings.default_increment_weight.toString(),
        distance: userSettings.default_increment_distance.toString(),
        time: userSettings.default_increment_time,
        resistanceLevel:
          userSettings.default_increment_resistance_level.toString(),
        calculationMultiplier:
          userSettings.default_increment_calculation_multiplier.toString(),
      };

      setDefaultIncrementInputValues(defaultIncrementValues);
      setDefaultIncrementOriginalValues({ ...defaultIncrementValues });

      const workoutPropertySet = CreateShownPropertiesSet(
        userSettings.shown_workout_properties,
        "workout"
      );
      setSelectedWorkoutProperties(workoutPropertySet);

      const timePeriodPropertySet = CreateShownPropertiesSet(
        userSettings.shown_time_period_properties,
        "time-period"
      );
      setSelectedTimePeriodProperties(timePeriodPropertySet);

      setFilterWeightRangeUnit(userSettings.default_unit_weight);
      setFilterDistanceRangeUnit(userSettings.default_unit_distance);

      FillInLoadExerciseOptions(
        userSettings.load_exercise_options_analytics,
        userSettings.load_exercise_options_categories_analytics,
        undefined,
        new Set(),
        validLoadExerciseOptionsCategories,
        defaultChartDataUnitCategoryMap,
        [],
        undefined,
        setLoadExerciseOptions,
        setLoadExerciseOptionsUnitCategoryPrimary,
        setLoadExerciseOptionsUnitCategorySecondary,
        setLoadExerciseOptionsUnitCategoriesPrimary,
        setLoadExerciseOptionsUnitCategoriesSecondary
      );
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUserSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (userSettings === undefined || !ValidateUserSetting(key, value))
      return false;

    const updatedUserSettings: UserSettings = {
      ...userSettings,
      [key]: value,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(`UPDATE user_settings SET ${key} = $1 WHERE id = $2`, [
        value,
        userSettings.id,
      ]);

      setUserSettings(updatedUserSettings);
      toast.success("Setting Updated");
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleDefaultIncrementValueChange = async (key: string) => {
    const updatedOriginalValues = { ...defaultIncrementOriginalValues };

    if (
      key === "weight" &&
      !defaultIncrementInputsInvalidityMap.weight &&
      defaultIncrementOriginalValues.weight !==
        defaultIncrementInputValues.weight
    ) {
      const newValue = ConvertNumberToTwoDecimals(
        Number(defaultIncrementInputValues.weight)
      );

      const updatedInputString = newValue.toString();

      updatedOriginalValues.weight = updatedInputString;

      const success = await updateUserSetting(
        "default_increment_weight",
        newValue
      );

      if (!success) return;
    }

    if (
      key === "distance" &&
      !defaultIncrementInputsInvalidityMap.distance &&
      defaultIncrementOriginalValues.distance !==
        defaultIncrementInputValues.distance
    ) {
      const newValue = ConvertNumberToTwoDecimals(
        Number(defaultIncrementInputValues.distance)
      );

      const updatedInputString = newValue.toString();

      updatedOriginalValues.distance = updatedInputString;

      const success = await updateUserSetting(
        "default_increment_distance",
        newValue
      );

      if (!success) return;
    }

    if (
      key === "time" &&
      !isTimeInputInvalid &&
      defaultIncrementOriginalValues.time !== defaultIncrementInputValues.time
    ) {
      updatedOriginalValues.time = defaultIncrementInputValues.time;

      const success = await updateUserSetting(
        "default_increment_time",
        defaultIncrementInputValues.time
      );

      if (!success) return;
    }

    if (
      key === "resistance-level" &&
      !defaultIncrementInputsInvalidityMap.resistanceLevel &&
      defaultIncrementOriginalValues.resistanceLevel !==
        defaultIncrementInputValues.resistanceLevel
    ) {
      const newValue = ConvertNumberToTwoDecimals(
        Number(defaultIncrementInputValues.resistanceLevel)
      );

      const updatedInputString = newValue.toString();

      updatedOriginalValues.resistanceLevel = updatedInputString;

      const success = await updateUserSetting(
        "default_increment_resistance_level",
        newValue
      );

      if (!success) return;
    }

    if (
      key === "calculation-multiplier" &&
      !defaultIncrementInputsInvalidityMap.calculationMultiplier &&
      defaultIncrementOriginalValues.calculationMultiplier !==
        defaultIncrementInputValues.calculationMultiplier
    ) {
      const newValue = ConvertNumberToTwoDecimals(
        Number(defaultIncrementInputValues.calculationMultiplier)
      );

      const updatedInputString = newValue.toString();

      updatedOriginalValues.calculationMultiplier = updatedInputString;

      const success = await updateUserSetting(
        "default_increment_calculation_multiplier",
        newValue
      );

      if (!success) return;
    }

    setDefaultIncrementInputValues(updatedOriginalValues);
    setDefaultIncrementOriginalValues({ ...updatedOriginalValues });
  };

  const handleDefaultPlateCollectionIdChange = async (
    plateCollection: PlateCollection
  ) => {
    const success = await updateUserSetting(
      "default_plate_collection_id",
      plateCollection.id
    );

    if (!success) return;

    specificSettingModal.onClose();
  };

  const handleSaveSpecificSettingButton = async () => {
    if (userSettings === undefined) return;

    // TODO: FIX
    if (specificSettingModalPage === "load-exercise-options-analytics") {
      const loadExerciseOptionsString =
        Array.from(loadExerciseOptions).join(",");

      const success = await updateUserSetting(
        "load_exercise_options_analytics",
        loadExerciseOptionsString
      );

      if (!success) return;
    }

    specificSettingModal.onClose();
  };

  const restoreDefaultSettings = async (
    unitType: string,
    locale: string,
    clockStyle: string
  ) => {
    if (userSettings === undefined) return;

    const useMetricUnits: boolean = unitType === "metric" ? true : false;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute("DELETE from user_settings WHERE id = $1", [
        userSettings.id,
      ]);

      const newUserSettings: UserSettings | undefined =
        await CreateDefaultUserSettings(useMetricUnits, locale, clockStyle);

      if (newUserSettings !== undefined) {
        setUserSettings(newUserSettings);
        createDefaultSettingsModal.onClose();
        toast.success("Settings Restored To Defaults");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenSpecificSettingModal = async (
    modalPage: SpecificSettingModalPage
  ) => {
    if (
      modalPage === "default-plate-calc" &&
      !presetsList.isEquipmentWeightListLoaded.current
    ) {
      await presetsList.getEquipmentWeights();
    }

    setSpecificSettingModalPage(modalPage);
    specificSettingModal.onOpen();
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <CreateDefaultSettingsModal
        createDefaultSettingsModal={createDefaultSettingsModal}
        doneButtonAction={restoreDefaultSettings}
        header="Restore Default Settings"
        extraContent={
          <div>
            <p className="text-lg text-center font-semibold text-danger">
              Reset all settings to their default values?
            </p>
          </div>
        }
        doneButtonText="Reset"
        isRestoreSettings={true}
        isDismissible={true}
      />
      <Modal
        isOpen={specificSettingModal.isOpen}
        onOpenChange={specificSettingModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {specificSettingModalPage === "default-plate-calc"
                  ? "Set Default Plate Collection"
                  : "Set Workout Rating Order"}
              </ModalHeader>
              <ModalBody>
                <div className="h-[400px] flex flex-col gap-2">
                  {specificSettingModalPage === "default-plate-calc" ? (
                    <PlateCollectionModalList
                      presetsList={presetsList}
                      handlePlateCollectionClick={
                        handleDefaultPlateCollectionIdChange
                      }
                      defaultPlateCollectionId={
                        userSettings.default_plate_collection_id
                      }
                    />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-stone-400 px-0.5">
                        Drag To Reorder Ratings
                      </span>
                      <Reorder.Group
                        className="flex flex-col gap-1"
                        values={workoutRatingsList}
                        onReorder={setWorkoutRatingsList}
                      >
                        {workoutRatingsList.map((item) => (
                          <Reorder.Item
                            className="flex justify-between items-center py-1 px-2 rounded-lg border-2 bg-default-50 cursor-grab hover:bg-default-100 active:bg-default-100 active:cursor-grabbing"
                            key={item.num}
                            value={item}
                          >
                            <span>{item.label}</span>
                            <ReorderIcon size={16} />
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-between">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                {specificSettingModalPage !== "default-plate-calc" && (
                  <Button
                    color="primary"
                    onPress={handleSaveSpecificSettingButton}
                  >
                    Save
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <LoadExerciseOptionsModal
        loadExerciseOptionsModal={loadExerciseOptionsModal}
        selectedExercise={undefined}
        loadExerciseOptions={loadExerciseOptions}
        setLoadExerciseOptions={setLoadExerciseOptions}
        disabledLoadExerciseOptions={new Set()}
        loadExerciseOptionsUnitCategoryPrimary={
          loadExerciseOptionsUnitCategoryPrimary
        }
        setLoadExerciseOptionsUnitCategoryPrimary={
          setLoadExerciseOptionsUnitCategoryPrimary
        }
        loadExerciseOptionsUnitCategorySecondary={
          loadExerciseOptionsUnitCategorySecondary
        }
        setLoadExerciseOptionsUnitCategorySecondary={
          setLoadExerciseOptionsUnitCategorySecondary
        }
        loadExerciseOptionsUnitCategoriesPrimary={
          loadExerciseOptionsUnitCategoriesPrimary
        }
        setLoadExerciseOptionsUnitCategoriesPrimary={
          setLoadExerciseOptionsUnitCategoriesPrimary
        }
        loadExerciseOptionsUnitCategoriesSecondary={
          loadExerciseOptionsUnitCategoriesSecondary
        }
        setLoadExerciseOptionsUnitCategoriesSecondary={
          setLoadExerciseOptionsUnitCategoriesSecondary
        }
        chartDataAreas={[]}
        chartDataUnitCategoryMap={defaultChartDataUnitCategoryMap}
        loadExerciseOptionsMap={loadExerciseOptionsMap}
        secondaryDataUnitCategory={undefined}
        validLoadExerciseOptionsCategories={validLoadExerciseOptionsCategories}
        // updateLoadExerciseOptions={() => {}}
        customHeader="Load Exercise Options (Analytics)"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Settings
          </h1>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Weight Unit</span>
            <WeightUnitDropdown
              value={userSettings.default_unit_weight}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Distance Unit</span>
            <DistanceUnitDropdown
              value={userSettings.default_unit_distance}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Show Timestamp On Completed Sets</span>
            <Switch
              aria-label="Show Timestamp On Completed Sets Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_timestamp_on_completed_set ? true : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_timestamp_on_completed_set",
                  value ? 1 : 0
                )
              }
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Time Input</span>
            <Select
              aria-label="Time Input Type Dropdown List"
              className="w-32"
              variant="faded"
              selectedKeys={[userSettings.default_time_input]}
              onChange={(e) =>
                updateUserSetting("default_time_input", e.target.value)
              }
              disallowEmptySelection
            >
              {Array.from(timeInputMap).map(([key, value]) => (
                <SelectItem key={key}>{value}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Default Measurement Unit (Circumference)
            </span>
            <MeasurementUnitDropdown
              value={userSettings.default_unit_measurement}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Date Format</span>
            <LocaleDropdown
              value={userSettings.locale}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Clock Format</span>
            <ClockStyleDropdown
              value={userSettings.clock_style}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="flex flex-1 text-lg">
              Time Input Behavior For HH:MM:SS
            </span>
            <TimeInputBehaviorDropdown
              value={userSettings.time_input_behavior_hhmmss}
              updateUserSetting={updateUserSetting}
              isHhmmss={true}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="flex flex-1 text-lg">
              Time Input Behavior For MM:SS
            </span>
            <TimeInputBehaviorDropdown
              value={userSettings.time_input_behavior_mmss}
              updateUserSetting={updateUserSetting}
              isHhmmss={false}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Show Secondary Exercise Groups In Exercise List
            </span>
            <Switch
              aria-label="Show Secondary Exercise Groups Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_secondary_exercise_groups ? true : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_secondary_exercise_groups",
                  value ? 1 : 0
                )
              }
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Automatically Update Active Measurements After Saving User
              Measurements
            </span>
            <Switch
              aria-label="Automatically Update Active Measurements Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.automatically_update_active_measurements
                  ? true
                  : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "automatically_update_active_measurements",
                  value ? 1 : 0
                )
              }
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Number Of New Sets</span>
            <NumSetsDropdown
              numNewSets={userSettings.default_num_new_sets}
              targetType="settings"
              updateUserSetting={updateUserSetting}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Properties To Display In Time Period List
            </span>
            <TimePeriodPropertyDropdown
              selectedTimePeriodProperties={selectedTimePeriodProperties}
              setSelectedTimePeriodProperties={setSelectedTimePeriodProperties}
              userSettings={userSettings}
              setUserSettings={setUserSettings}
              isInSettingsPage
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Diet Log Entry Day</span>
            <DietLogDayDropdown
              value={
                userSettings.default_diet_log_day_is_yesterday === 1
                  ? "Yesterday"
                  : "Today"
              }
              targetType="settings"
              updateUserSetting={updateUserSetting}
            />
          </div>
          <div className="flex gap-3 items-center justify-between pr-1">
            <span className="text-lg">
              Default Load Exercise Options For Analytics Page
            </span>
            <Button
              color="primary"
              size="sm"
              onPress={() => loadExerciseOptionsModal.onOpen()}
            >
              Select
            </Button>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Show Warmup Sets In Exercise Details Page
            </span>
            <Switch
              aria-label="Show Warmup Sets In Exercise Details Page Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_warmups_in_exercise_details ? true : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_warmups_in_exercise_details",
                  value ? 1 : 0
                )
              }
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Show Multiset Sets In Exercise Details Page
            </span>
            <Switch
              aria-label="Show Multiset Sets In Exercise Details Page Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_multisets_in_exercise_details ? true : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_multisets_in_exercise_details",
                  value ? 1 : 0
                )
              }
            />
          </div>
          <h3 className="flex justify-center text-lg font-medium">Workouts</h3>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Properties To Display In Workout List
            </span>
            <WorkoutPropertyDropdown
              selectedWorkoutProperties={selectedWorkoutProperties}
              setSelectedWorkoutProperties={setSelectedWorkoutProperties}
              userSettings={userSettings}
              setUserSettings={setUserSettings}
              isInSettingsPage
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Workout Ratings Order</span>
            <Button
              color="primary"
              size="sm"
              onPress={() =>
                handleOpenSpecificSettingModal("workout-rating-order")
              }
            >
              Select
            </Button>
          </div>
          <h3 className="flex justify-center text-lg font-medium">
            Calculations
          </h3>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Show Calculation Buttons Next To Weight And Distance Inputs
            </span>
            <Switch
              aria-label="Show Calculation Buttons Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={userSettings.show_calculation_buttons ? true : false}
              onValueChange={(value) =>
                updateUserSetting("show_calculation_buttons", value ? 1 : 0)
              }
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Automatically Save Last Calculation String For Exercises
            </span>
            <Switch
              aria-label="Save Last Calculation String Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={userSettings.save_calculation_string ? true : false}
              onValueChange={(value) =>
                updateUserSetting("save_calculation_string", value ? 1 : 0)
              }
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Weight Calculation Tab</span>
            <Select
              aria-label="Default Weight Calculation Tab Dropdown List"
              className="w-[6rem]"
              variant="faded"
              selectedKeys={[userSettings.default_calculation_tab]}
              onChange={(e) =>
                updateUserSetting("default_calculation_tab", e.target.value)
              }
              disallowEmptySelection
            >
              <SelectItem key="plate">Plate</SelectItem>
              <SelectItem key="sum">Sum</SelectItem>
            </Select>
          </div>
          <div className="flex gap-3 items-center justify-between pr-1">
            <span className="text-lg">Default Plate Collection</span>
            <Button
              color="primary"
              size="sm"
              onPress={() =>
                handleOpenSpecificSettingModal("default-plate-calc")
              }
            >
              Select
            </Button>
          </div>
          <h3 className="flex justify-center text-lg font-medium">
            Default Increments
          </h3>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Weight</span>
            <div className="flex gap-2 items-center">
              <Input
                aria-label="Default Weight Increment Input Field"
                className="w-[4rem]"
                size="sm"
                value={defaultIncrementInputValues.weight}
                variant="faded"
                onValueChange={(value) =>
                  setDefaultIncrementInputValues((prev) => ({
                    ...prev,
                    weight: value,
                  }))
                }
                isInvalid={defaultIncrementInputsInvalidityMap.weight}
              />
              <Button
                color="primary"
                size="sm"
                isDisabled={
                  defaultIncrementInputsInvalidityMap.weight ||
                  defaultIncrementOriginalValues.weight ===
                    defaultIncrementInputValues.weight
                }
                onPress={() => handleDefaultIncrementValueChange("weight")}
              >
                Change
              </Button>
            </div>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Distance</span>
            <div className="flex gap-2 items-center">
              <Input
                aria-label="Default Distance Increment Input Field"
                className="w-[4rem]"
                size="sm"
                value={defaultIncrementInputValues.distance}
                variant="faded"
                onValueChange={(value) =>
                  setDefaultIncrementInputValues({
                    ...defaultIncrementInputValues,
                    distance: value,
                  })
                }
                isInvalid={defaultIncrementInputsInvalidityMap.distance}
              />
              <Button
                color="primary"
                size="sm"
                isDisabled={
                  defaultIncrementInputsInvalidityMap.distance ||
                  defaultIncrementOriginalValues.distance ===
                    defaultIncrementInputValues.distance
                }
                onPress={() => handleDefaultIncrementValueChange("distance")}
              >
                Change
              </Button>
            </div>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Time</span>
            <div className="flex gap-2 items-center">
              <TimeValueInput
                defaultTimeInput={userSettings.default_time_input}
                time_input_behavior_hhmmss={
                  userSettings.time_input_behavior_hhmmss
                }
                time_input_behavior_mmss={userSettings.time_input_behavior_mmss}
                setIsTimeInputInvalid={setIsTimeInputInvalid}
                defaultIncrementInputValues={defaultIncrementInputValues}
                setDefaultIncrementInputValues={setDefaultIncrementInputValues}
                isClearable={false}
                isSmall={true}
                showTimeLabel={false}
              />
              <Button
                color="primary"
                size="sm"
                isDisabled={
                  isTimeInputInvalid ||
                  defaultIncrementOriginalValues.time ===
                    defaultIncrementInputValues.time ||
                  defaultIncrementInputValues.time === 0
                }
                onPress={() => handleDefaultIncrementValueChange("time")}
              >
                Change
              </Button>
            </div>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Resistance Level</span>
            <div className="flex gap-2 items-center">
              <Input
                aria-label="Default Resistance Level Increment Input Field"
                className="w-[4rem]"
                size="sm"
                value={defaultIncrementInputValues.resistanceLevel}
                variant="faded"
                onValueChange={(value) =>
                  setDefaultIncrementInputValues({
                    ...defaultIncrementInputValues,
                    resistanceLevel: value,
                  })
                }
                isInvalid={defaultIncrementInputsInvalidityMap.resistanceLevel}
              />
              <Button
                color="primary"
                size="sm"
                isDisabled={
                  defaultIncrementInputsInvalidityMap.resistanceLevel ||
                  defaultIncrementOriginalValues.resistanceLevel ===
                    defaultIncrementInputValues.resistanceLevel
                }
                onPress={() =>
                  handleDefaultIncrementValueChange("resistance-level")
                }
              >
                Change
              </Button>
            </div>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Calculation Multiplier</span>
            <div className="flex gap-2 items-center">
              <Input
                aria-label="Default Calculation Multiplier Increment Input Field"
                className="w-[4rem]"
                size="sm"
                value={defaultIncrementInputValues.calculationMultiplier}
                variant="faded"
                onValueChange={(value) =>
                  setDefaultIncrementInputValues((prev) => ({
                    ...prev,
                    calculationMultiplier: value,
                  }))
                }
                isInvalid={
                  defaultIncrementInputsInvalidityMap.calculationMultiplier
                }
              />
              <Button
                color="primary"
                size="sm"
                isDisabled={
                  defaultIncrementInputsInvalidityMap.calculationMultiplier ||
                  defaultIncrementOriginalValues.calculationMultiplier ===
                    defaultIncrementInputValues.calculationMultiplier
                }
                onPress={() =>
                  handleDefaultIncrementValueChange("calculation-multiplier")
                }
              >
                Change
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              variant="flat"
              onPress={() => createDefaultSettingsModal.onOpen()}
            >
              Restore Default Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
