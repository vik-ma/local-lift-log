import { useState, useMemo, ReactNode } from "react";
import {
  UserSettings,
  DefaultIncrementInputInvalidityMap,
  UseDefaultIncrementValuesReturnType,
} from "../typings";
import {
  CreateDefaultUserSettings,
  IsStringInvalidNumber,
  ConvertNumberToTwoDecimals,
  UpdateUserSetting,
} from "../helpers";
import {
  Switch,
  Select,
  SelectItem,
  Button,
  useDisclosure,
  Input,
} from "@heroui/react";
import {
  WeightUnitDropdown,
  DistanceUnitDropdown,
  MeasurementUnitDropdown,
  LocaleDropdown,
  ClockStyleDropdown,
  TimeInputBehaviorDropdown,
  CreateDefaultSettingsModal,
  TimeValueInput,
  DietLogDayDropdown,
  SearchInput,
  PaginationOptionsDropdown,
  CalendarDateMarkingsDropdown,
} from "../components";
import toast from "react-hot-toast";
import Database from "@tauri-apps/plugin-sql";
import { TIME_INPUT_MAP } from "../constants";

type SettingsListProps = {
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  useDefaultIncrementValues: UseDefaultIncrementValuesReturnType;
};

type SettingsItemCategory =
  | "General"
  | "Exercises"
  | "Workouts"
  | "Default Increments"
  | "Logging"
  | "Time Periods";

type SettingsItem = {
  label: string;
  content: ReactNode;
  category: SettingsItemCategory;
};

const MIN_VALUE_DEFAULT_INCREMENTS = 0;
const DO_NOT_ALLOW_MIN_VALUE_DEFAULT_INCREMENTS = true;

export const SettingsList = ({
  userSettings,
  setUserSettings,
  useDefaultIncrementValues,
}: SettingsListProps) => {
  const {
    defaultIncrementInputValues,
    setDefaultIncrementInputValues,
    defaultIncrementOriginalValues,
    setDefaultIncrementOriginalValues,
    timeInSeconds,
    setTimeInSeconds,
  } = useDefaultIncrementValues;

  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const createDefaultSettingsModal = useDisclosure();

  const defaultIncrementInputsInvalidityMap =
    useMemo((): DefaultIncrementInputInvalidityMap => {
      const values: DefaultIncrementInputInvalidityMap = {
        weight: IsStringInvalidNumber(
          defaultIncrementInputValues.weight,
          MIN_VALUE_DEFAULT_INCREMENTS,
          DO_NOT_ALLOW_MIN_VALUE_DEFAULT_INCREMENTS
        ),
        distance: IsStringInvalidNumber(
          defaultIncrementInputValues.distance,
          MIN_VALUE_DEFAULT_INCREMENTS,
          DO_NOT_ALLOW_MIN_VALUE_DEFAULT_INCREMENTS
        ),
        resistanceLevel: IsStringInvalidNumber(
          defaultIncrementInputValues.resistanceLevel,
          MIN_VALUE_DEFAULT_INCREMENTS,
          DO_NOT_ALLOW_MIN_VALUE_DEFAULT_INCREMENTS
        ),
        calculationMultiplier: IsStringInvalidNumber(
          defaultIncrementInputValues.calculationMultiplier,
          MIN_VALUE_DEFAULT_INCREMENTS,
          DO_NOT_ALLOW_MIN_VALUE_DEFAULT_INCREMENTS
        ),
      };
      return values;
    }, [defaultIncrementInputValues]);

  const updateUserSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (userSettings === undefined) return false;

    const success = UpdateUserSetting(
      key,
      value,
      userSettings,
      setUserSettings
    );

    if (!success) return false;

    toast.success("Setting Updated");
    return true;
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
      defaultIncrementOriginalValues.time !== timeInSeconds
    ) {
      updatedOriginalValues.time = timeInSeconds;

      const success = await updateUserSetting(
        "default_increment_time",
        timeInSeconds
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

  const restoreDefaultSettings = async (
    unitType: string,
    locale: string,
    clockStyle: string
  ) => {
    if (userSettings === undefined) return;

    const useMetricUnits = unitType === "metric" ? true : false;

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

  const settingsList = useMemo(() => {
    const settingsItemList: SettingsItem[] = [
      {
        label: "Date Format",
        content: (
          <div key="locale" className="flex gap-3 items-center justify-between">
            <span>Date Format</span>
            <LocaleDropdown
              value={userSettings.locale}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Clock Format",
        content: (
          <div
            key="clock_style"
            className="flex gap-3 items-center justify-between"
          >
            <span>Clock Format</span>
            <ClockStyleDropdown
              value={userSettings.clock_style}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Default Weight Unit",
        content: (
          <div
            key="default_unit_weight"
            className="flex gap-3 items-center justify-between"
          >
            <span>Default Weight Unit</span>
            <WeightUnitDropdown
              value={userSettings.default_unit_weight}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Default Distance Unit",
        content: (
          <div
            key="default_unit_distance"
            className="flex gap-3 items-center justify-between"
          >
            <span>Default Distance Unit</span>
            <DistanceUnitDropdown
              value={userSettings.default_unit_distance}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Default Measurement Unit (Circumference)",
        content: (
          <div
            key="default_unit_measurement"
            className="flex gap-3 items-center justify-between"
          >
            <span>Default Measurement Unit (Circumference)</span>
            <MeasurementUnitDropdown
              value={userSettings.default_unit_measurement}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Number Of Items Displayed Per Page In Lists",
        content: (
          <div
            key="num_pagination_items_list_desktop"
            className="flex gap-3 items-center justify-between"
          >
            <span>Number Of Items Per Page In Lists</span>
            <PaginationOptionsDropdown
              value={userSettings.num_pagination_items_list_desktop}
              updateUserSetting={updateUserSetting}
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Never Show Delete Modal Confirmation When Deleting Item",
        content: (
          <div
            key="never_show_delete_modal"
            className="flex gap-3 items-center justify-between"
          >
            <span>Never Show Delete Modal Confirmation When Deleting Item</span>
            <Switch
              aria-label="Never Show Delete Modal Confirmation Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={userSettings.never_show_delete_modal ? true : false}
              onValueChange={(value) =>
                updateUserSetting("never_show_delete_modal", value ? 1 : 0)
              }
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Default Calendar Date Marking",
        content: (
          <div
            key="calendar_date_marking"
            className="flex gap-3 items-center justify-between"
          >
            <span>Default Calendar Date Marking</span>
            <CalendarDateMarkingsDropdown
              value={userSettings.calendar_date_marking}
              updateUserSetting={updateUserSetting}
              targetType="settings"
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Default Time Input",
        content: (
          <div
            key="default_time_input"
            className="flex gap-3 items-center justify-between"
          >
            <span>Default Time Input</span>
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
              {Array.from(TIME_INPUT_MAP).map(([key, value]) => (
                <SelectItem key={key}>{value}</SelectItem>
              ))}
            </Select>
          </div>
        ),
        category: "General",
      },
      {
        label: "Time Input Behavior For HH:MM:SS",
        content: (
          <div
            key="time_input_behavior_hhmmss"
            className="flex gap-3 items-center justify-between"
          >
            <span className="flex flex-1">
              Time Input Behavior For HH:MM:SS
            </span>
            <TimeInputBehaviorDropdown
              value={userSettings.time_input_behavior_hhmmss}
              updateUserSetting={updateUserSetting}
              isHhmmss={true}
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Time Input Behavior For MM:SS",
        content: (
          <div
            key="time_input_behavior_mmss"
            className="flex gap-3 items-center justify-between"
          >
            <span className="flex flex-1">Time Input Behavior For MM:SS</span>
            <TimeInputBehaviorDropdown
              value={userSettings.time_input_behavior_mmss}
              updateUserSetting={updateUserSetting}
              isHhmmss={false}
            />
          </div>
        ),
        category: "General",
      },
      {
        label: "Show Warmup Sets In Exercise Details Page",
        content: (
          <div
            key="show_warmups_in_exercise_details"
            className="flex gap-3 items-center justify-between"
          >
            <span>Show Warmup Sets In Exercise Details Page</span>
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
        ),
        category: "Exercises",
      },
      {
        label: "Show Multiset Sets In Exercise Details Page",
        content: (
          <div
            key="show_multisets_in_exercise_details"
            className="flex gap-3 items-center justify-between"
          >
            <span>Show Multiset Sets In Exercise Details Page</span>
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
        ),
        category: "Exercises",
      },
      {
        label: "Show Pace In Exercise Details Page",
        content: (
          <div
            key="show_pace_in_exercise_details"
            className="flex gap-3 items-center justify-between"
          >
            <span>Show Pace In Exercise Details Page</span>
            <Switch
              aria-label="Show Pace Exercise In Details Page Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_pace_in_exercise_details ? true : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_pace_in_exercise_details",
                  value ? 1 : 0
                )
              }
            />
          </div>
        ),
        category: "Exercises",
      },
      {
        label: "Show Set Comments In Exercise Details Page",
        content: (
          <div
            key="show_set_comments_in_exercise_details"
            className="flex gap-3 items-center justify-between"
          >
            <span>Show Set Comments In Exercise Details Page</span>
            <Switch
              aria-label="Show Set Comments In Details Page Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_set_comments_in_exercise_details
                  ? true
                  : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_set_comments_in_exercise_details",
                  value ? 1 : 0
                )
              }
            />
          </div>
        ),
        category: "Exercises",
      },
      {
        label: "Show Workout Comments In Exercise Details Page",
        content: (
          <div
            key="show_workout_comments_in_exercise_details"
            className="flex gap-3 items-center justify-between"
          >
            <span>Show Workout Comments In Exercise Details Page</span>
            <Switch
              aria-label="Show Workout Comments In Exercise Details Page Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_workout_comments_in_exercise_details
                  ? true
                  : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_workout_comments_in_exercise_details",
                  value ? 1 : 0
                )
              }
            />
          </div>
        ),
        category: "Exercises",
      },
      {
        label: "Show Timestamp On Completed Sets",
        content: (
          <div
            key="show_timestamp_on_completed_set"
            className="flex gap-3 items-center justify-between"
          >
            <span>Show Timestamp On Completed Sets</span>
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
        ),
        category: "Workouts",
      },
      {
        label: "Show Get Latest Body Weight Button",
        content: (
          <div
            key="show_get_latest_body_weight_button"
            className="flex gap-3 items-center justify-between"
          >
            <span>Show Get Latest Body Weight Button</span>
            <Switch
              aria-label="Show Get Latest Body Weight Button Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_get_latest_body_weight_button ? true : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_get_latest_body_weight_button",
                  value ? 1 : 0
                )
              }
            />
          </div>
        ),
        category: "Workouts",
      },
      {
        label: "Show Outdated Body Weight Message",
        content: (
          <div
            key="show_outdated_body_weight_message"
            className="flex gap-3 items-center justify-between"
          >
            <span>Show Outdated Body Weight Message</span>
            <Switch
              aria-label="Show Outdated Body Weight Message Switch Element"
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_outdated_body_weight_message ? true : false
              }
              onValueChange={(value) =>
                updateUserSetting(
                  "show_outdated_body_weight_message",
                  value ? 1 : 0
                )
              }
            />
          </div>
        ),
        category: "Workouts",
      },
      {
        label: "Show Calculation Buttons Next To Weight And Distance Inputs",
        content: (
          <div
            key="show_calculation_buttons"
            className="flex gap-3 items-center justify-between"
          >
            <span>
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
        ),
        category: "Workouts",
      },
      {
        label: "Automatically Save Last Calculation String For Exercises",
        content: (
          <div
            key="save_calculation_string"
            className="flex gap-3 items-center justify-between"
          >
            <span>
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
        ),
        category: "Workouts",
      },
      {
        label: "Default Weight Calculation Tab",
        content: (
          <div
            key="default_calculation_tab"
            className="flex gap-3 items-center justify-between"
          >
            <span>Default Weight Calculation Tab</span>
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
        ),
        category: "Workouts",
      },
      {
        label: "Weight",
        content: (
          <div
            key="default_increment_weight"
            className="flex gap-3 items-center justify-between"
          >
            <span>Weight</span>
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
                aria-label="Change Default Weight Increment Button"
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
        ),
        category: "Default Increments",
      },
      {
        label: "Distance",
        content: (
          <div
            key="default_increment_distance"
            className="flex gap-3 items-center justify-between"
          >
            <span>Distance</span>
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
                aria-label="Change Default Distance Increment Button"
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
        ),
        category: "Default Increments",
      },
      {
        label: "Time",
        content: (
          <div
            key="default_increment_time"
            className="flex gap-3 items-center justify-between"
          >
            <span>Time</span>
            <div className="flex gap-2 items-center">
              <TimeValueInput
                userSettings={userSettings}
                setIsTimeInputInvalid={setIsTimeInputInvalid}
                timeInSeconds={timeInSeconds}
                setTimeInSeconds={setTimeInSeconds}
                isClearable={false}
                isSmall={true}
                showTimeLabel={false}
                allow0={false}
              />
              <Button
                aria-label="Change Default Time Increment Button"
                color="primary"
                size="sm"
                isDisabled={
                  isTimeInputInvalid ||
                  defaultIncrementOriginalValues.time === timeInSeconds
                }
                onPress={() => handleDefaultIncrementValueChange("time")}
              >
                Change
              </Button>
            </div>
          </div>
        ),
        category: "Default Increments",
      },
      {
        label: "Resistance Level",
        content: (
          <div
            key="default_increment_resistance_level"
            className="flex gap-3 items-center justify-between"
          >
            <span>Resistance Level</span>
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
                aria-label="Change Default Resistance Level Increment Button"
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
        ),
        category: "Default Increments",
      },
      {
        label: "Calculation Multiplier",
        content: (
          <div
            key="default_increment_calculation_multiplier"
            className="flex gap-3 items-center justify-between"
          >
            <span>Calculation Multiplier</span>
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
                aria-label="Change Default Calculation Multiplier Increment Button"
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
        ),
        category: "Default Increments",
      },
      {
        label:
          "Automatically Update Active Measurements After Saving User Measurements",
        content: (
          <div
            key="automatically_update_active_measurements"
            className="flex gap-3 items-center justify-between"
          >
            <span>
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
        ),
        category: "Logging",
      },
      {
        label: "Default Diet Log Entry Day",
        content: (
          <div
            key="default_diet_log_day_is_yesterday"
            className="flex gap-3 items-center justify-between"
          >
            <span>Default Diet Log Entry Day</span>
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
        ),
        category: "Logging",
      },
    ];

    return settingsItemList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettings]);

  const { filteredSettingsList, numFilteredSettings } = useMemo(() => {
    const filteredSettingsList: SettingsItem[] = [];

    let numFilteredSettings = 0;

    const containsCategoryMap = new Map<SettingsItemCategory, boolean>([
      ["General", false],
      ["Exercises", false],
      ["Workouts", false],
      ["Default Increments", false],
      ["Logging", false],
      ["Time Periods", false],
    ]);

    for (const settingsItem of settingsList) {
      if (
        filterQuery !== "" &&
        !settingsItem.label
          .toLocaleLowerCase()
          .includes(filterQuery.toLocaleLowerCase()) &&
        !settingsItem.category
          .toLocaleLowerCase()
          .includes(filterQuery.toLocaleLowerCase())
      )
        continue;

      const category = settingsItem.category;

      if (containsCategoryMap.get(category) === false) {
        const headerItem: SettingsItem = {
          label: category,
          content: (
            <h3
              key={`header-${category}`}
              className="flex leading-none text-2xl font-semibold pt-1"
            >
              {category}
            </h3>
          ),
          category: category,
        };

        filteredSettingsList.push(headerItem);
        containsCategoryMap.set(category, true);
      }

      filteredSettingsList.push(settingsItem);
      numFilteredSettings++;
    }

    return { filteredSettingsList, numFilteredSettings };
  }, [settingsList, filterQuery]);

  return (
    <>
      <CreateDefaultSettingsModal
        createDefaultSettingsModal={createDefaultSettingsModal}
        doneButtonAction={restoreDefaultSettings}
        header="Restore Default Settings"
        extraContent={
          <div className="flex flex-col gap-3">
            <p className="text-lg font-medium text-danger">
              Reset all settings to their default values?
            </p>
            <h3 className="text-lg font-medium pb-1">New Settings</h3>
          </div>
        }
        doneButtonText="Reset"
        isRestoreSettings={true}
        isDismissible={true}
      />
      <div className="flex flex-col gap-2 w-full">
        <SearchInput
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={numFilteredSettings}
          totalListLength={settingsList.length}
          isListFiltered={false}
        />
        <div className="flex flex-col gap-2 w-full px-0.5">
          {filteredSettingsList.map((settingsItem) => settingsItem.content)}
        </div>
        <div className="flex justify-center pt-0.5 pb-2.5">
          <Button
            variant="flat"
            color="danger"
            onPress={() => createDefaultSettingsModal.onOpen()}
          >
            Restore Default Settings
          </Button>
        </div>
      </div>
    </>
  );
};
