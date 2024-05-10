import { useState, useEffect } from "react";
import { UserSettings, UserSettingsOptional } from "../typings";
import {
  GetUserSettings,
  UpdateShowTimestamp,
  UpdateDefaultUnitWeight,
  UpdateDefaultUnitDistance,
  UpdateDefaultTimeInput,
  UpdateDefaultUnitMeasurement,
  UpdateLocale,
} from "../helpers";
import { Switch, Select, SelectItem, DatePicker } from "@nextui-org/react";
import {
  LoadingSpinner,
  WeightUnitDropdown,
  DistanceUnitDropdown,
  MeasurementUnitDropdown,
  LocaleDropdown,
} from "../components";
import toast, { Toaster } from "react-hot-toast";
import { I18nProvider } from "@react-aria/i18n";

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

  const handleSetShowTimestampChange = async (value: boolean) => {
    if (userSettings === undefined) return;

    const updatedSettings: UserSettingsOptional = {
      id: userSettings.id,
      show_timestamp_on_completed_set: value ? 1 : 0,
    };

    await UpdateShowTimestamp(updatedSettings);
    setUserSettings((prev) => ({ ...prev!, ...updatedSettings }));
    showToast();
  };

  const handleDefaultUnitWeightChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const weightUnit: string = e.target.value;

    const updatedSettings: UserSettingsOptional = {
      id: userSettings.id,
      default_unit_weight: weightUnit,
    };

    await UpdateDefaultUnitWeight(updatedSettings);
    setUserSettings((prev) => ({ ...prev!, ...updatedSettings }));
    showToast();
  };

  const handleDefaultUnitDistanceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const distanceUnit: string = e.target.value;

    const updatedSettings: UserSettingsOptional = {
      id: userSettings.id,
      default_unit_distance: distanceUnit,
    };

    await UpdateDefaultUnitDistance(updatedSettings);
    setUserSettings((prev) => ({ ...prev!, ...updatedSettings }));
    showToast();
  };

  const handleDefaultTimeInputChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const timeInputType: string = e.target.value;

    const updatedSettings: UserSettingsOptional = {
      id: userSettings.id,
      default_time_input: timeInputType,
    };

    await UpdateDefaultTimeInput(updatedSettings);
    setUserSettings((prev) => ({ ...prev!, ...updatedSettings }));
    showToast();
  };

  const handleDefaultUnitMeasurementChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const measurementUnit: string = e.target.value;

    const updatedSettings: UserSettingsOptional = {
      id: userSettings.id,
      default_unit_measurement: measurementUnit,
    };

    await UpdateDefaultUnitMeasurement(updatedSettings);
    setUserSettings((prev) => ({ ...prev!, ...updatedSettings }));
    showToast();
  };

  const handleLocaleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (userSettings === undefined) return;

    const localeValue: string = e.target.value;

    const updatedSettings: UserSettingsOptional = {
      id: userSettings.id,
      locale: localeValue,
    };

    await UpdateLocale(updatedSettings);
    setUserSettings((prev) => ({ ...prev!, ...updatedSettings }));
    showToast();
  };

  const showToast = () => {
    toast.success("Setting Updated");
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
              <span className="text-lg">Date Locale</span>
              <LocaleDropdown
                value={userSettings!.locale}
                setUserSettings={handleLocaleChange}
                targetType="locale"
              />
            </div>
            <div className="flex justify-end">
              <I18nProvider locale={userSettings!.locale}>
                <DatePicker
                  className="w-40"
                  label="Date example"
                  variant="faded"
                />
              </I18nProvider>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
