import { useState, useEffect } from "react";
import { UserSettings } from "../typings";
import { GetUserSettings } from "../helpers/UserSettings/GetUserSettings";
import { Switch } from "@nextui-org/react";
import { UpdateUserSettings } from "../helpers/UserSettings/UpdateUserSettings";
import LoadingSpinner from "../components/LoadingSpinner";

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
    const updatedSettings: UserSettings = {
      ...userSettings!,
      show_timestamp_on_completed_set: value.toString(),
    };

    await updateUserSettings(updatedSettings);
  };

  const updateUserSettings = async (userSettings: UserSettings) => {
    await UpdateUserSettings(userSettings);
    setUserSettings(userSettings);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Settings
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-2">
            <Switch
              color="success"
              size="lg"
              isSelected={
                userSettings?.show_timestamp_on_completed_set === "true"
                  ? true
                  : false
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
