import { useState, useEffect } from "react";
import { UserSettingsOptional, UserWeight } from "../typings";
import { LoadingSpinner, WeightUnitDropdown } from "../components";
import { GetDefaultUnitValues } from "../helpers";

export default function UserMeasurementsPage() {
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [userWeights, setUserWeights] = useState<UserWeight>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettingsOptional | undefined =
        await GetDefaultUnitValues();
      if (settings !== undefined) setUserSettings(settings);
      setIsLoading(false);
    };

    loadUserSettings();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Measurements
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div>
            <h2 className="text-2xl font-semibold">Body Weight</h2>
          </div>
        )}
      </div>
    </>
  );
}
