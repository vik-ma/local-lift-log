import { useState } from "react";
import { DeleteModal, DietLogAccordions } from "../components";
import { useDefaultDietLog, useDietLogList } from "../hooks";
import { DietLog } from "../typings";
import { useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";

type OperationType = "add" | "edit" | "delete";

export default function DietLogList() {
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultDietLog = useDefaultDietLog();

  const [operatingDietLog, setOperatingDietLog] =
    useState<DietLog>(defaultDietLog);

  const deleteModal = useDisclosure();

  const dietLogList = useDietLogList(true);

  const { dietLogs, setDietLogs, deleteDietLog } = dietLogList;

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
