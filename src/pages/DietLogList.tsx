import { useEffect, useState } from "react";
import { DeleteModal, DietLogAccordions, LoadingSpinner } from "../components";
import { useDefaultDietLog, useDietLogList } from "../hooks";
import { DietLog, UserSettings } from "../typings";
import { useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { GetUserSettings } from "../helpers";

type OperationType = "add" | "edit" | "delete";

export default function DietLogList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultDietLog = useDefaultDietLog();

  const [operatingDietLog, setOperatingDietLog] =
    useState<DietLog>(defaultDietLog);

  const deleteModal = useDisclosure();

  const dietLogList = useDietLogList(true);

  const { dietLogs, setDietLogs, isDietLogListLoaded, deleteDietLog } =
    dietLogList;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();
      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  const deleteDietLogEntry = async () => {
    if (operationType !== "delete" || operatingDietLog.id === 0) return;

    const { success } = await deleteDietLog(operatingDietLog);

    console.log(success);

    if (!success) return;

    toast.success("Diet Log Entry Deleted");
    deleteModal.onClose();
  };

  const handleDietLogAccordionClick = (dietLog: DietLog, index: number) => {
    const updatedDietLog: DietLog = {
      ...dietLog,
      isExpanded: !dietLog.isExpanded,
    };

    const updatedDietLogs = [...dietLogs];
    updatedDietLogs[index] = updatedDietLog;

    setDietLogs(updatedDietLogs);
  };

  const handleDietLogOptionSelection = (key: string, dietLog: DietLog) => {
    if (key === "edit") {
      //  TODO: ADD
    } else if (key === "delete") {
      setOperatingDietLog(dietLog);
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  if (userSettings === undefined || !isDietLogListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Diet Log Entry"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the latest Diet Log
            entry on{" "}
            <span className="text-secondary">
              {operatingDietLog.formattedDate}
            </span>
            ?
          </p>
        }
        deleteButtonAction={() => deleteDietLogEntry()}
      />
      <div className="flex flex-col items-center gap-1">
        <DietLogAccordions
          dietLogEntries={dietLogs}
          handleDietLogAccordionClick={handleDietLogAccordionClick}
          handleDietLogOptionSelection={handleDietLogOptionSelection}
        />
      </div>
    </>
  );
}
