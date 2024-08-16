import { useState, useEffect, useMemo } from "react";
import { UserSettings } from "../typings";
import {
  GetUserSettings,
  UpdateAllUserSettings,
  CreateDefaultUserSettings,
  IsStringInvalidNumberOr0,
} from "../helpers";
import {
  Switch,
  Select,
  SelectItem,
  Button,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import {
  LoadingSpinner,
  WeightUnitDropdown,
  DistanceUnitDropdown,
  MeasurementUnitDropdown,
  LocaleDropdown,
  ClockStyleDropdown,
  TimeInputBehaviorDropdown,
  SettingsModal,
} from "../components";
import toast, { Toaster } from "react-hot-toast";
import Database from "tauri-plugin-sql-api";

type DefaultIncrementInputs = {
  weight: string;
  distance: string;
  time: string;
  resistanceLevel: string;
};

type DefaultIncrementInputValidityMap = {
  weight: boolean;
  distance: boolean;
  time: boolean;
  resistanceLevel: boolean;
};

export default function Settings() {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const settingsModal = useDisclosure();

  const emptyDefaultIncrementValues: DefaultIncrementInputs = useMemo(() => {
    return {
      weight: "",
      distance: "",
      time: "",
      resistanceLevel: "",
    };
  }, []);

  const [defaultIncrementInputValues, setDefaultIncrementInputValues] =
    useState<DefaultIncrementInputs>(emptyDefaultIncrementValues);

  const [defaultIncrementOriginalValues, setDefaultIncrementOriginalValues] =
    useState<DefaultIncrementInputs>(emptyDefaultIncrementValues);

  const defaultIncrementInputsValidityMap =
    useMemo((): DefaultIncrementInputValidityMap => {
      const values: DefaultIncrementInputValidityMap = {
        weight: IsStringInvalidNumberOr0(defaultIncrementInputValues.weight),
        distance: IsStringInvalidNumberOr0(
          defaultIncrementInputValues.distance
        ),
        time: IsStringInvalidNumberOr0(defaultIncrementInputValues.time),
        resistanceLevel: IsStringInvalidNumberOr0(
          defaultIncrementInputValues.resistanceLevel
        ),
      };
      return values;
    }, [defaultIncrementInputValues]);

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettings | undefined = await GetUserSettings();
      if (settings !== undefined) {
        setUserSettings(settings);

        const defaultIncrementValues: DefaultIncrementInputs = {
          weight: settings.default_increment_weight.toString(),
          distance: settings.default_increment_distance.toString(),
          time: settings.default_increment_time.toString(),
          resistanceLevel:
            settings.default_increment_resistance_level.toString(),
        };

        setDefaultIncrementInputValues(defaultIncrementValues);
        setDefaultIncrementOriginalValues({ ...defaultIncrementValues });
      }
    };

    loadUserSettings();
  }, []);

  const updateSettings = async (
    updatedSettings: UserSettings
  ): Promise<boolean> => {
    const success = await UpdateAllUserSettings(updatedSettings);

    if (success) {
      setUserSettings(updatedSettings);
      toast.success("Setting Updated");
      return true;
    }

    return false;
  };

  const handleSetShowTimestampChange = async (value: boolean) => {
    if (userSettings === undefined) return;

    const updatedSettings: UserSettings = {
      ...userSettings,
      show_timestamp_on_completed_set: value ? 1 : 0,
    };

    updateSettings(updatedSettings);
  };

  const handleDefaultUnitWeightChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const weightUnit: string = e.target.value;

    const updatedSettings: UserSettings = {
      ...userSettings,
      default_unit_weight: weightUnit,
    };

    updateSettings(updatedSettings);
  };

  const handleDefaultUnitDistanceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const distanceUnit: string = e.target.value;

    const updatedSettings: UserSettings = {
      ...userSettings,
      default_unit_distance: distanceUnit,
    };

    updateSettings(updatedSettings);
  };

  const handleDefaultTimeInputChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const timeInputType: string = e.target.value;

    const updatedSettings: UserSettings = {
      ...userSettings,
      default_time_input: timeInputType,
    };

    updateSettings(updatedSettings);
  };

  const handleDefaultUnitMeasurementChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const measurementUnit: string = e.target.value;

    const updatedSettings: UserSettings = {
      ...userSettings,
      default_unit_measurement: measurementUnit,
    };

    updateSettings(updatedSettings);
  };

  const handleLocaleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const localeValue: string = e.target.value;

    const updatedSettings: UserSettings = {
      ...userSettings,
      locale: localeValue,
    };

    updateSettings(updatedSettings);
  };

  const handleClockStyleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const clockStyleValue: string = e.target.value;

    const updatedSettings: UserSettings = {
      ...userSettings,
      clock_style: clockStyleValue,
    };

    updateSettings(updatedSettings);
  };

  const handleTimeInputBehaviorChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    isHhmmss: boolean
  ) => {
    if (userSettings === undefined) return;

    const timeInputBehavior: string = e.target.value;

    const updatedSettings: UserSettings = { ...userSettings };

    if (isHhmmss) {
      updatedSettings.time_input_behavior_hhmmss = timeInputBehavior;
    } else {
      updatedSettings.time_input_behavior_mmss = timeInputBehavior;
    }

    updateSettings(updatedSettings);
  };

  const handleSetShowWorkoutRatingChange = async (value: boolean) => {
    if (userSettings === undefined) return;

    const updatedSettings: UserSettings = {
      ...userSettings,
      show_workout_rating: value ? 1 : 0,
    };

    updateSettings(updatedSettings);
  };

  const handleDefaultIncrementValueChange = async (key: string) => {
    if (userSettings === undefined) return;

    const updatedSettings = {
      ...userSettings,
    };

    const updatedOriginalValues = { ...defaultIncrementOriginalValues };

    if (key === "weight") {
      if (
        defaultIncrementInputsValidityMap.weight ||
        defaultIncrementOriginalValues.weight ===
          defaultIncrementInputValues.weight
      )
        return;

      updatedSettings.default_increment_weight = Number(
        defaultIncrementInputValues.weight
      );

      updatedOriginalValues.weight = defaultIncrementInputValues.weight;
    } else if (key === "distance") {
      if (
        defaultIncrementInputsValidityMap.distance ||
        defaultIncrementOriginalValues.distance ===
          defaultIncrementInputValues.distance
      )
        return;

      updatedSettings.default_increment_distance = Number(
        defaultIncrementInputValues.distance
      );

      updatedOriginalValues.distance = defaultIncrementInputValues.distance;
    } else if (key === "time") {
      if (
        defaultIncrementInputsValidityMap.time ||
        defaultIncrementOriginalValues.time === defaultIncrementInputValues.time
      )
        return;

      updatedSettings.default_increment_time = Number(
        defaultIncrementInputValues.time
      );

      updatedOriginalValues.time = defaultIncrementInputValues.time;
    } else if (key === "resistance-level") {
      if (
        defaultIncrementInputsValidityMap.resistanceLevel ||
        defaultIncrementOriginalValues.resistanceLevel ===
          defaultIncrementInputValues.resistanceLevel
      )
        return;

      updatedSettings.default_increment_resistance_level = Number(
        defaultIncrementInputValues.resistanceLevel
      );

      updatedOriginalValues.resistanceLevel =
        defaultIncrementInputValues.resistanceLevel;
    } else return;

    const success = await updateSettings(updatedSettings);

    if (success) setDefaultIncrementOriginalValues(updatedOriginalValues);
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
        settingsModal.onClose();
        toast.success("Settings Restored To Defaults");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <SettingsModal
        settingsModal={settingsModal}
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
              setUserSettings={handleDefaultUnitWeightChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Distance Unit</span>
            <DistanceUnitDropdown
              value={userSettings.default_unit_distance}
              setUserSettings={handleDefaultUnitDistanceChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Show Timestamp On Completed Sets</span>
            <Switch
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={
                userSettings.show_timestamp_on_completed_set ? true : false
              }
              onValueChange={(value) => handleSetShowTimestampChange(value)}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Time Input</span>
            <Select
              aria-label="Time Input Type Dropdown List"
              className="w-32"
              variant="faded"
              selectedKeys={[userSettings.default_time_input]}
              onChange={(value) => handleDefaultTimeInputChange(value)}
              disallowEmptySelection
            >
              <SelectItem key="hhmmss" value="hhmmss">
                HH:MM:SS
              </SelectItem>
              <SelectItem key="mmss" value="mmss">
                MM:SS
              </SelectItem>
              <SelectItem key="minutes" value="minutes">
                Minutes
              </SelectItem>
              <SelectItem key="seconds" value="seconds">
                Seconds
              </SelectItem>
            </Select>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">
              Default Measurement Unit (Circumference)
            </span>
            <MeasurementUnitDropdown
              value={userSettings.default_unit_measurement}
              setUserSettings={handleDefaultUnitMeasurementChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Date Format</span>
            <LocaleDropdown
              value={userSettings.locale}
              setUserSettings={handleLocaleChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Clock Format</span>
            <ClockStyleDropdown
              value={userSettings.clock_style}
              setUserSettings={handleClockStyleChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="flex flex-1 text-lg">
              Time Input Behavior For HH:MM:SS
            </span>
            <TimeInputBehaviorDropdown
              value={userSettings.time_input_behavior_hhmmss}
              setUserSettings={handleTimeInputBehaviorChange}
              isHhmmss={true}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="flex flex-1 text-lg">
              Time Input Behavior For MM:SS
            </span>
            <TimeInputBehaviorDropdown
              value={userSettings.time_input_behavior_mmss}
              setUserSettings={handleTimeInputBehaviorChange}
              isHhmmss={false}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Show Workout Rating</span>
            <Switch
              className="flex-row-reverse gap-3"
              color="primary"
              size="lg"
              isSelected={userSettings.show_workout_rating ? true : false}
              onValueChange={(value) => handleSetShowWorkoutRatingChange(value)}
            />
          </div>
          <h3 className="flex justify-center text-lg font-medium">
            Default Increments
          </h3>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Weight</span>
            <div className="flex gap-2">
              <Input
                aria-label="Default Weight Increment Input Field"
                className="w-[5.5rem]"
                value={defaultIncrementInputValues.weight}
                variant="faded"
                onValueChange={(value) =>
                  setDefaultIncrementInputValues((prev) => ({
                    ...prev,
                    weight: value,
                  }))
                }
                isInvalid={defaultIncrementInputsValidityMap.weight}
                isClearable
              />
              <Button
                color="primary"
                isDisabled={
                  defaultIncrementInputsValidityMap.weight ||
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
            <div className="flex gap-2">
              <Input
                aria-label="Default Distance Increment Input Field"
                className="w-[5.5rem]"
                value={defaultIncrementInputValues.distance}
                variant="faded"
                onValueChange={(value) =>
                  setDefaultIncrementInputValues({
                    ...defaultIncrementInputValues,
                    distance: value,
                  })
                }
                isInvalid={defaultIncrementInputsValidityMap.distance}
                isClearable
              />
              <Button
                color="primary"
                isDisabled={
                  defaultIncrementInputsValidityMap.distance ||
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
            <div className="flex gap-2">
              <Input
                aria-label="Default Time Increment Input Field"
                className="w-[5.5rem]"
                value={defaultIncrementInputValues.time}
                variant="faded"
                onValueChange={(value) =>
                  setDefaultIncrementInputValues({
                    ...defaultIncrementInputValues,
                    time: value,
                  })
                }
                isInvalid={defaultIncrementInputsValidityMap.time}
                isClearable
              />
              <Button
                color="primary"
                isDisabled={
                  defaultIncrementInputsValidityMap.time ||
                  defaultIncrementOriginalValues.time ===
                    defaultIncrementInputValues.time
                }
                onPress={() => handleDefaultIncrementValueChange("time")}
              >
                Change
              </Button>
            </div>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Resistance Level</span>
            <div className="flex gap-2">
              <Input
                aria-label="Default Resistance Level Increment Input Field"
                className="w-[5.5rem]"
                value={defaultIncrementInputValues.resistanceLevel}
                variant="faded"
                onValueChange={(value) =>
                  setDefaultIncrementInputValues({
                    ...defaultIncrementInputValues,
                    resistanceLevel: value,
                  })
                }
                isInvalid={defaultIncrementInputsValidityMap.resistanceLevel}
                isClearable
              />
              <Button
                color="primary"
                isDisabled={
                  defaultIncrementInputsValidityMap.resistanceLevel ||
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
          <div className="flex justify-center">
            <Button
              className="font-medium"
              variant="flat"
              onPress={() => settingsModal.onOpen()}
            >
              Restore Default Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
