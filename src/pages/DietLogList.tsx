import { DietLogAccordions } from "../components";
import { useDietLogList } from "../hooks";
import { DietLog } from "../typings";

export default function DietLogList() {
  const dietLogList = useDietLogList(true);

  const { dietLogs, setDietLogs } = dietLogList;

  const handleDietLogAccordionClick = (dietLog: DietLog, index: number) => {
    const updatedDietLog: DietLog = {
      ...dietLog,
      isExpanded: !dietLog.isExpanded,
    };

    const updatedDietLogs = [...dietLogs];
    updatedDietLogs[index] = updatedDietLog;

    setDietLogs(updatedDietLogs);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <DietLogAccordions
          dietLogEntries={dietLogs}
          handleDietLogAccordionClick={handleDietLogAccordionClick}
          handleDietLogOptionSelection={() => {}}
        />
      </div>
    </>
  );
}
