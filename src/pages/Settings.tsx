import { useState, useEffect } from "react";
import { UserSettings } from "../typings";
import { GetUserSettings, UpdateAllUserSettings } from "../helpers";
import { Switch, Select, SelectItem } from "@nextui-org/react";
import {
  LoadingSpinner,
  WeightUnitDropdown,
  DistanceUnitDropdown,
  MeasurementUnitDropdown,
  LocaleDropdown,
  ClockStyleDropdown,
} from "../components";
import toast, { Toaster } from "react-hot-toast";

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettings | undefined = await GetUserSettings();
      if (settings !== undefined) setUserSettings(settings);
      setIsLoading(false);
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

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Settings
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-3">
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
            <Switch
              className="flex-row-reverse gap-3"
              color="success"
              size="lg"
              isSelected={
                userSettings?.show_timestamp_on_completed_set ? true : false
              }
              onValueChange={(value) => handleSetShowTimestampChange(value)}
            >
              Show Timestamp On Completed Sets
            </Switch>
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
          </div>
        )}
      </div>
    </>
  );
}
