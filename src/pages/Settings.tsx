import { useState, useEffect } from "react";
import { UserSettings } from "../typings";
import {
  GetUserSettings,
  UpdateAllUserSettings,
  CreateDefaultUserSettings,
} from "../helpers";
import {
  Switch,
  Select,
  SelectItem,
  Button,
  useDisclosure,
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

export default function Settings() {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const settingsModal = useDisclosure();

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettings | undefined = await GetUserSettings();
      if (settings !== undefined) setUserSettings(settings);
    };

    loadUserSettings();
  }, []);

  const updateSettings = async (updatedSettings: UserSettings) => {
    const success = await UpdateAllUserSettings(updatedSettings);

    if (success) {
      setUserSettings(updatedSettings);
      toast.success("Setting Updated");
    }
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
            <p className="text-xl font-semibold text-red-500">
              Reset all settings to their default values?
            </p>
          </div>
        }
        doneButtonText="Reset"
        isRestoreSettings={true}
        isDismissable={true}
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
              value={userSettings!.default_unit_weight}
              setUserSettings={handleDefaultUnitWeightChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Default Distance Unit</span>
            <DistanceUnitDropdown
              value={userSettings!.default_unit_distance}
              setUserSettings={handleDefaultUnitDistanceChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Show Timestamp On Completed Sets</span>
            <Switch
              className="flex-row-reverse gap-3"
              color="success"
              size="lg"
              isSelected={
                userSettings?.show_timestamp_on_completed_set ? true : false
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
              selectedKeys={[userSettings!.default_time_input]}
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
              value={userSettings!.default_unit_measurement}
              setUserSettings={handleDefaultUnitMeasurementChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Date Format</span>
            <LocaleDropdown
              value={userSettings!.locale}
              setUserSettings={handleLocaleChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Clock Format</span>
            <ClockStyleDropdown
              value={userSettings!.clock_style}
              setUserSettings={handleClockStyleChange}
              targetType="settings"
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="flex flex-1 text-lg">
              Time Input Behavior For HH:MM:SS
            </span>
            <TimeInputBehaviorDropdown
              value={userSettings!.time_input_behavior_hhmmss}
              setUserSettings={handleTimeInputBehaviorChange}
              isHhmmss={true}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="flex flex-1 text-lg">
              Time Input Behavior For MM:SS
            </span>
            <TimeInputBehaviorDropdown
              value={userSettings!.time_input_behavior_mmss}
              setUserSettings={handleTimeInputBehaviorChange}
              isHhmmss={false}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <span className="text-lg">Show Workout Rating</span>
            <Switch
              className="flex-row-reverse gap-3"
              color="success"
              size="lg"
              isSelected={userSettings?.show_workout_rating ? true : false}
              onValueChange={(value) => handleSetShowWorkoutRatingChange(value)}
            />
          </div>
          <div className="flex justify-center">
            <Button variant="flat" onPress={() => settingsModal.onOpen()}>
              Restore Default Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
