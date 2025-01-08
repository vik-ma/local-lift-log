import { useEffect, useState } from "react";
import { DietLog, UserSettings } from "../typings";
import {
  DeleteModal,
  DietLogAccordions,
  DietLogModal,
  LoadingSpinner,
} from "../components";
import {
  ConvertEmptyStringToNull,
  ConvertInputStringToNumber,
  ConvertInputStringToNumberOrNull,
  FormatYmdDateString,
  GetCurrentYmdDateString,
  GetUserSettings,
  GetYesterdayYmdDateString,
  ShouldDietLogDisableExpansion,
} from "../helpers";
import {
  useDefaultDietLog,
  useDietLogEntryInputs,
  useDietLogList,
} from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";

type OperationType = "add" | "edit" | "delete";

export default function DietLogIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [latestDietLog, setLatestDietLog] = useState<DietLog>();

  const defaultDietLog = useDefaultDietLog();

  const [operatingDietLog, setOperatingDietLog] =
    useState<DietLog>(defaultDietLog);

  const dietLogModal = useDisclosure();
  const deleteModal = useDisclosure();

  const dietLogList = useDietLogList(true);

  const {
    isDietLogListLoaded,
    dietLogs,
    addDietLog,
    deleteDietLog,
    dietLogMap,
  } = dietLogList;

  const dietLogEntryInputs = useDietLogEntryInputs();

  const {
    caloriesInput,
    commentInput,
    fatInput,
    carbsInput,
    proteinInput,
    targetDay,
    setTargetDay,
    isDietLogEntryInputValid,
    resetInputs,
    setIsCustomDateEntry,
  } = dietLogEntryInputs;

  useEffect(() => {
    if (!isDietLogListLoaded.current) return;

    if (dietLogs[0] !== undefined) {
      dietLogs[0].isExpanded = true;
      setLatestDietLog(dietLogs[0]);
    }

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      if (userSettings.default_diet_log_day_is_yesterday === 1) {
        setTargetDay("Yesterday");
      }
    };

    loadUserSettings();
    // isDietLogListLoaded.current need to be specifically included in array,
    // but isDietLogListLoaded is not needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTargetDay, isDietLogListLoaded.current]);

  const addDietLogEntry = async () => {
    if (
      operatingDietLog.id !== 0 ||
      operationType !== "add" ||
      !isDietLogEntryInputValid
    )
      return;

    const calories = ConvertInputStringToNumber(caloriesInput);
    const comment = ConvertEmptyStringToNull(commentInput);
    const fat = ConvertInputStringToNumberOrNull(fatInput);
    const carbs = ConvertInputStringToNumberOrNull(carbsInput);
    const protein = ConvertInputStringToNumberOrNull(proteinInput);

    const date =
      targetDay === "Yesterday"
        ? GetYesterdayYmdDateString()
        : GetCurrentYmdDateString();

    const formattedDate = FormatYmdDateString(date);

    const disableExpansion = ShouldDietLogDisableExpansion(fat, carbs, protein);

    const dietLog: DietLog = {
      ...operatingDietLog,
      date,
      calories,
      fat,
      carbs,
      protein,
      comment,
      formattedDate,
      isExpanded: !disableExpansion,
      disableExpansion,
    };

    const newDietLog = await addDietLog(dietLog);

    if (newDietLog === undefined) return;

    if (latestDietLog === undefined || newDietLog.date > latestDietLog.date) {
      setLatestDietLog(newDietLog);
    }

    resetDietLogEntry();
    dietLogModal.onClose();
    toast.success("Diet Log Entry Added");
  };

  const deleteDietLogEntry = async () => {
    if (latestDietLog === undefined || operationType !== "delete") return;

    const { success, newLatestDietLog } = await deleteDietLog(
      latestDietLog,
      true
    );

    if (!success) return;

    if (newLatestDietLog !== undefined) {
      newLatestDietLog.isExpanded = true;
    }

    setLatestDietLog(newLatestDietLog);

    toast.success("Diet Log Entry Deleted");
    deleteModal.onClose();
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
    setIsCustomDateEntry(false);
    dietLogModal.onOpen();
  };

  const handleDietLogOptionSelection = (key: string) => {
    if (key === "edit") {
      // TODO: ADD
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const handleDietLogAccordionClick = (dietLog: DietLog) => {
    const updatedDietLog: DietLog = {
      ...dietLog,
      isExpanded: !dietLog.isExpanded,
    };

    setLatestDietLog(updatedDietLog);
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Diet Log Entry"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the latest Diet Log
            entry?
          </p>
        }
        deleteButtonAction={() => deleteDietLogEntry()}
      />
      <DietLogModal
        dietLogModal={dietLogModal}
        operatingDietLog={operatingDietLog}
        useDietLogEntryInputs={dietLogEntryInputs}
        dietLogMap={dietLogMap.current}
        userSettings={userSettings}
        buttonAction={addDietLogEntry}
        latestDietLog={latestDietLog}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Diet Log
          </h1>
        </div>
        <div className="flex flex-col items-center gap-2.5">
          {latestDietLog === undefined ? (
            <h2 className="text-stone-400">No Diet Log Entries Added</h2>
          ) : (
            <DietLogAccordions
              dietLogEntries={[latestDietLog]}
              handleDietLogAccordionClick={handleDietLogAccordionClick}
              handleDietLogOptionSelection={handleDietLogOptionSelection}
              showDayLabel
            />
          )}
          <Button
            className="font-medium"
            variant="flat"
            onPress={handleAddDietLogEntryButton}
          >
            Add Diet Log Entry
          </Button>
        </div>
      </div>
    </>
  );
}
