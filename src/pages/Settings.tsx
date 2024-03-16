import { useState, useEffect } from "react";
import { UserSettings, UserSettingsOptional } from "../typings";
import {
  GetUserSettings,
  UpdateShowTimestamp,
  ValidWeightUnits,
  ValidDistanceUnits,
  UpdateDefaultUnitWeight,
} from "../helpers";
import { Switch, Select, SelectItem } from "@nextui-org/react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast, { Toaster } from "react-hot-toast";

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const weightUnits: string[] = ValidWeightUnits();
  const distanceUnits: string[] = ValidDistanceUnits();

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
              <Select
                aria-label="Select Default Weight Unit"
                className="max-w-20"
                size="lg"
                variant="faded"
                selectedKeys={[userSettings!.default_unit_weight]}
                onChange={(value) => handleDefaultUnitWeightChange(value)}
              >
                {weightUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex gap-3 items-center justify-between">
              <span className="text-lg">Default Distance Unit</span>
              <Select
                aria-label="Select Default Distance Unit"
                className="max-w-20"
                size="lg"
                variant="faded"
                selectedKeys={[userSettings!.default_unit_distance]}
                onChange={(value) => handleDefaultUnitDistanceChange(value)}
              >
                {distanceUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </Select>
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
          </div>
        )}
      </div>
    </>
  );
}
