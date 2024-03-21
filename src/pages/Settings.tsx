import { useState, useEffect } from "react";
import { UserSettings, UserSettingsOptional } from "../typings";
import {
  GetUserSettings,
  UpdateShowTimestamp,
  UpdateDefaultUnitWeight,
  UpdateDefaultTimeInput,
} from "../helpers";
import { Switch, Select, SelectItem } from "@nextui-org/react";
import {
  LoadingSpinner,
  WeightUnitDropdown,
  DistanceUnitDropdown,
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

    await UpdateDefaultUnitWeight(updatedSettings);
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

  const showToast = () => {
    toast.success("Setting Updated");
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
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
                actionSettings={handleDefaultUnitWeightChange}
                targetType="settings"
              />
            </div>
            <div className="flex gap-3 items-center justify-between">
              <span className="text-lg">Default Distance Unit</span>
              <DistanceUnitDropdown
                value={userSettings!.default_unit_distance}
                actionSettings={handleDefaultUnitDistanceChange}
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
                label="Input Type"
                className="max-w-32"
                size="sm"
                variant="faded"
                selectedKeys={[userSettings!.default_time_input]}
                onChange={(value) => handleDefaultTimeInputChange(value)}
              >
                <SelectItem key="hhmmss" value="hhmmss">
                  HH:MM:SS
                </SelectItem>
                <SelectItem key="minutes" value="minutes">
                  Minutes
                </SelectItem>
                <SelectItem key="seconds" value="seconds">
                  Seconds
                </SelectItem>
              </Select>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
