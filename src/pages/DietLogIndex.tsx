import { useEffect, useState } from "react";
import { DietLog, UserSettings } from "../typings";
import { DietLogModal, LoadingSpinner } from "../components";
import {
  ConvertEmptyStringToNull,
  ConvertInputStringToNumber,
  ConvertInputStringToNumberOrNull,
  GetCurrentYmdDateString,
  GetUserSettings,
  GetYesterdayYmdDateString,
  InsertDietLogIntoDatabase,
} from "../helpers";
import { useDefaultDietLog, useDietLogEntryInputs } from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import Database from "tauri-plugin-sql-api";

type OperationType = "add" | "edit" | "delete";

export default function DietLogIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [latestDietLog, setLatestDietLog] = useState<DietLog>();

  const defaultDietLog = useDefaultDietLog();

  const [operatingDietLog, setOperatingDietLog] =
    useState<DietLog>(defaultDietLog);

  const dietLogModal = useDisclosure();

  const dietLogEntryInputs = useDietLogEntryInputs();

  const {
    caloriesInput,
    noteInput,
    fatInput,
    carbsInput,
    proteinInput,
    targetDay,
    setTargetDay,
    isDietLogEntryInputValid,
    resetInputs,
  } = dietLogEntryInputs;

  useEffect(() => {
    const getLatestDietLog = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<DietLog[]>(
          `SELECT * FROM diet_logs
           ORDER BY date DESC LIMIT 1`
        );

        const dietLog: DietLog = result[0];

        setLatestDietLog(dietLog);
      } catch (error) {
        console.log(error);
      }
    };

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      if (userSettings.default_diet_log_day_is_yesterday === 1) {
        setTargetDay("Yesterday");
      }
    };

    getLatestDietLog();
    loadUserSettings();
  }, [setTargetDay]);

  const addDietLogEntry = async () => {
    if (
      operatingDietLog.id !== 0 ||
      operationType !== "add" ||
      !isDietLogEntryInputValid
    )
      return;

    const calories = ConvertInputStringToNumber(caloriesInput);
    const note = ConvertEmptyStringToNull(noteInput);
    const fat = ConvertInputStringToNumberOrNull(fatInput);
    const carbs = ConvertInputStringToNumberOrNull(carbsInput);
    const protein = ConvertInputStringToNumberOrNull(proteinInput);

    const date =
      targetDay === "Yesterday"
        ? GetYesterdayYmdDateString()
        : GetCurrentYmdDateString();

    const newDietLog: DietLog = {
      ...operatingDietLog,
      date,
      calories,
      fat,
      carbs,
      protein,
      note,
    };

    const newDietLogId = await InsertDietLogIntoDatabase(newDietLog);

    if (newDietLogId === 0) return;

    newDietLog.id = newDietLogId;

    setLatestDietLog(newDietLog)

    resetDietLogEntry();
    dietLogModal.onClose();
    toast.success("Diet Log Entry Added");
  };

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
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DietLogModal
        dietLogModal={dietLogModal}
        dietLog={operatingDietLog}
        useDietLogEntryInputs={dietLogEntryInputs}
        buttonAction={addDietLogEntry}
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
