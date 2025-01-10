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
  GetUserSettings,
  ShouldDietLogDisableExpansion,
} from "../helpers";
import {
  useDefaultDietLog,
  useDietLogEntryInputs,
  useDietLogList,
} from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type OperationType = "add" | "edit" | "delete";

export default function DietLogIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultDietLog = useDefaultDietLog();

  const [latestDietLog, setLatestDietLog] = useState<DietLog>(defaultDietLog);

  const dietLogModal = useDisclosure();
  const deleteModal = useDisclosure();

  const dietLogList = useDietLogList(true);

  const navigate = useNavigate();

  const {
    isDietLogListLoaded,
    dietLogs,
    addDietLog,
    updateDietLog,
    deleteDietLog,
    dietLogMap,
  } = dietLogList;

  const dietLogEntryInputs = useDietLogEntryInputs(false);

  const {
    caloriesInput,
    commentInput,
    fatInput,
    carbsInput,
    proteinInput,
    setTargetDay,
    isDietLogEntryInputValid,
    resetInputs,
    setIsCustomDateEntry,
    loadDietLogInputs,
  } = dietLogEntryInputs;

  useEffect(() => {
    if (!isDietLogListLoaded.current) return;

    if (dietLogs[0] !== undefined) {
      if (!dietLogs[0].disableExpansion) {
        dietLogs[0].isExpanded = true;
      }

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

  const addDietLogEntry = async (date: string) => {
    if (
      operationType !== "add" ||
      !isDietLogEntryInputValid ||
      dietLogMap.has(date)
    )
      return;

    const calories = ConvertInputStringToNumber(caloriesInput);
    const comment = ConvertEmptyStringToNull(commentInput);
    const fat = ConvertInputStringToNumberOrNull(fatInput);
    const carbs = ConvertInputStringToNumberOrNull(carbsInput);
    const protein = ConvertInputStringToNumberOrNull(proteinInput);

    const formattedDate = FormatYmdDateString(date);

    const disableExpansion = ShouldDietLogDisableExpansion(fat, carbs, protein);

    const dietLog: DietLog = {
      id: 0,
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

  const updateDietLogEntry = async (date: string) => {
    if (
      operationType !== "edit" ||
      latestDietLog.id === 0 ||
      !isDietLogEntryInputValid
    )
      return;

    const calories = ConvertInputStringToNumber(caloriesInput);
    const comment = ConvertEmptyStringToNull(commentInput);
    const fat = ConvertInputStringToNumberOrNull(fatInput);
    const carbs = ConvertInputStringToNumberOrNull(carbsInput);
    const protein = ConvertInputStringToNumberOrNull(proteinInput);

    const formattedDate = FormatYmdDateString(date);

    const disableExpansion = ShouldDietLogDisableExpansion(fat, carbs, protein);

    const updatedDietLog: DietLog = {
      id: latestDietLog.id,
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

    const { success, newLatestDietLog } = await updateDietLog(
      updatedDietLog,
      true
    );

    if (!success || newLatestDietLog === undefined) return;

    newLatestDietLog.isExpanded = !newLatestDietLog.disableExpansion;
    setLatestDietLog(newLatestDietLog);

    resetDietLogEntry();
    dietLogModal.onClose();
    toast.success("Diet Log Entry Updated");
  };

  const deleteDietLogEntry = async () => {
    if (operationType !== "delete" || latestDietLog.id === 0) return;

    const { success, newLatestDietLog } = await deleteDietLog(
      latestDietLog,
      true
    );

    if (!success) return;

    if (newLatestDietLog !== undefined) {
      newLatestDietLog.isExpanded = true;
      setLatestDietLog(newLatestDietLog);
    } else {
      setLatestDietLog(defaultDietLog);
    }

    toast.success("Diet Log Entry Deleted");
    deleteModal.onClose();
  };

  const resetDietLogEntry = () => {
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
      handleEditLatestDietLog();
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const handleEditLatestDietLog = () => {
    if (latestDietLog.id === 0) return;

    setOperationType("edit");
    loadDietLogInputs(latestDietLog);
    setIsCustomDateEntry(true);

    dietLogModal.onOpen();
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
        dietLog={latestDietLog}
        useDietLogEntryInputs={dietLogEntryInputs}
        dietLogMap={dietLogMap}
        userSettings={userSettings}
        isEditing={operationType === "edit"}
        buttonAction={
          operationType === "edit" ? updateDietLogEntry : addDietLogEntry
        }
      />
      <div className="flex flex-col items-center gap-3">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Diet Log
          </h1>
        </div>
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex flex-col items-center gap-2">
            <h2 className="flex items-center gap-2">
              {latestDietLog.id === 0 ? (
                <span className="text-stone-400">
                  No Diet Log Entries Added
                </span>
              ) : (
                <>
                  <span className="font-semibold text-lg">
                    Latest Diet Log Entry
                  </span>
                  {latestDietLog.id !== 0 && (
                    <Button
                      color="secondary"
                      variant="flat"
                      size="sm"
                      onPress={() => navigate("/diet-log/list")}
                    >
                      View History
                    </Button>
                  )}
                </>
              )}
            </h2>
            {latestDietLog.id !== 0 && (
              <DietLogAccordions
                dietLogEntries={[latestDietLog]}
                handleDietLogAccordionClick={handleDietLogAccordionClick}
                handleDietLogOptionSelection={handleDietLogOptionSelection}
                showDayLabel
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="font-medium"
              variant="flat"
              onPress={handleAddDietLogEntryButton}
            >
              Add Diet Log Entry
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
