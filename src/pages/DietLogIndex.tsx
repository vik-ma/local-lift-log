import { useEffect, useState } from "react";
import { DietLog, UserSettings } from "../typings";
import { DietLogModal, LoadingSpinner } from "../components";
import { GetUserSettings } from "../helpers";
import { useDefaultDietLog } from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";

export default function DietLogIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [targetDay, setTargetDay] = useState<string>("Today");

  const defaultDietLog = useDefaultDietLog();

  const [operatingDietLog, setOperatingDietLog] =
    useState<DietLog>(defaultDietLog);

  const dietLogModal = useDisclosure();

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DietLogModal
        dietLogModal={dietLogModal}
        dietLog={operatingDietLog}
        setDietLog={setOperatingDietLog}
        targetDay={targetDay}
        setTargetDay={setTargetDay}
        userSettings={userSettings}
        buttonAction={() => {}}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Diet Log
          </h1>
        </div>
        <Button
          className="font-medium"
          variant="flat"
          onPress={() => dietLogModal.onOpen()}
        >
          Add Diet Log Entry
        </Button>
      </div>
    </>
  );
}
