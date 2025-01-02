import { useEffect, useState } from "react";
import { DietLog, UserSettings } from "../typings";
import { DietLogModal, LoadingSpinner } from "../components";
import { GetUserSettings } from "../helpers";
import { useDefaultDietLog, useDietLogEntryInputs } from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";

type OperationType = "add" | "edit" | "delete";

export default function DietLogIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultDietLog = useDefaultDietLog();

  const [operatingDietLog, setOperatingDietLog] =
    useState<DietLog>(defaultDietLog);

  const dietLogModal = useDisclosure();

  const dietLogEntryInputs = useDietLogEntryInputs();

  const { setTargetDay, resetInputs } = dietLogEntryInputs;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      if (userSettings.default_diet_log_day_is_yesterday === 1) {
        setTargetDay("Yesterday");
      }
    };

    loadUserSettings();
  }, [setTargetDay]);

  const resetDietLogEntry = () => {
    setOperatingDietLog(defaultDietLog);
    setOperationType("add");
    resetInputs();
  };

  const handleAddDietLogEntryButton = () => {
    if (operationType !== "add") {
      resetDietLogEntry();
    }
    dietLogModal.onOpen();
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DietLogModal
        dietLogModal={dietLogModal}
        dietLog={operatingDietLog}
        useDietLogEntryInputs={dietLogEntryInputs}
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
          onPress={handleAddDietLogEntryButton}
        >
          Add Diet Log Entry
        </Button>
      </div>
    </>
  );
}
