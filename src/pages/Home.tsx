import { useEffect, useRef, useState } from "react";
import { Button, useDisclosure } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { UserSettings } from "../typings";
import {
  GetUserSettings,
  CreateDefaultUserSettings,
  CreateDefaultExercises,
  CreateDefaultEquipmentWeights,
  CreateDefaultMeasurements,
  CreateDefaultDistances,
} from "../helpers";
import { SettingsModal } from "../components";

export default function Home() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isUserSettingsLoaded, setIsUserSettingsLoaded] =
    useState<boolean>(false);

  const navigate = useNavigate();

  const initialized = useRef(false);

  const settingsModal = useDisclosure();

  const createDefaultUserSettings = async (
    unitType: string,
    locale: string,
    clockStyle: string
  ) => {
    const useMetricUnits: boolean = unitType === "metric" ? true : false;

    const defaultUserSettings: UserSettings | undefined =
      await CreateDefaultUserSettings(useMetricUnits, locale, clockStyle);

    // Create Default User Settings
    if (defaultUserSettings !== undefined) {
      setUserSettings(defaultUserSettings);

      // Create Default Exercise List
      await CreateDefaultExercises();

      // Create Default Equipment Weights
      await CreateDefaultEquipmentWeights(useMetricUnits);

      // Create Default Measurement List
      await CreateDefaultMeasurements(useMetricUnits);

      // Create Default Distance List
      await CreateDefaultDistances(useMetricUnits);

      setIsUserSettingsLoaded(true);
      settingsModal.onClose();
    }
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      if (isUserSettingsLoaded) return;

      try {
        const userSettings = await GetUserSettings();
        if (userSettings !== undefined) {
          // If UserSettings exists
          setUserSettings(userSettings);
          setIsUserSettingsLoaded(true);
        } else {
          // If no UserSettings exists

          // Stop useEffect running twice in dev
          if (!initialized.current) {
            initialized.current = true;
          } else return;

          settingsModal.onOpen();
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
  }, []);

  const asd = "23 Jan, 2025";

  console.log(asd.substring(0, asd.length - 5))

  return (
    <>
      <SettingsModal
        settingsModal={settingsModal}
        doneButtonAction={createDefaultUserSettings}
      />
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Home
          </h1>
        </div>
        <div className="flex justify-center">
          <Button
            className="font-medium"
            size="lg"
            color="primary"
            onPress={() => navigate("/test")}
          >
            GO TO TEST PAGE
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <p>Settings Id: {userSettings?.id}</p>
          <p>Active Routine Id: {userSettings?.active_routine_id}</p>
        </div>
      </div>
    </>
  );
}
