import { useEffect, useState } from "react";
import {
  DeleteModal,
  DietLogAccordions,
  DietLogModal,
  FilterDietLogListModal,
  ListFilters,
  ListPageSearchInput,
  LoadingSpinner,
} from "../components";
import { useDefaultDietLog, useDietLogList } from "../hooks";
import { DietLog, DietLogDateEntryType, UserSettings } from "../typings";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@heroui/react";
import toast from "react-hot-toast";
import { GetUserSettings } from "../helpers";

type OperationType = "add" | "edit" | "delete";

export default function DietLogList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [dateEntryType, setDateEntryType] =
    useState<DietLogDateEntryType>("custom");

  const defaultDietLog = useDefaultDietLog();

  const [operatingDietLog, setOperatingDietLog] =
    useState<DietLog>(defaultDietLog);

  const dietLogModal = useDisclosure();
  const deleteModal = useDisclosure();

  const dietLogList = useDietLogList(true);

  const {
    dietLogs,
    setDietLogs,
    filteredDietLogs,
    dietLogMap,
    isDietLogListLoaded,
    addDietLog,
    updateDietLog,
    deleteDietLog,
    filterQuery,
    setFilterQuery,
    sortCategory,
    handleSortOptionSelection,
    filterDietLogListModal,
    dietLogListFilters,
    addDietLogEntryRange,
  } = dietLogList;

  const { filterMap, removeFilter, prefixMap } = dietLogListFilters;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();
      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  const addDietLogEntry = async (dietLog: DietLog) => {
    if (operationType !== "add" || operatingDietLog.id !== 0) return;

    const newDietLog = await addDietLog(dietLog);

    if (newDietLog === undefined) return;

    dietLogModal.onClose();
    toast.success("Diet Log Entry Added");
  };

  const updateDietLogEntry = async (dietLog: DietLog) => {
    if (operationType !== "edit") return;

    const updatedDietLog = await updateDietLog(dietLog);

    if (updatedDietLog === undefined) return;

    dietLogModal.onClose();
    toast.success("Diet Log Entry Updated");
  };

  const deleteDietLogEntry = async (dietLogToDelete?: DietLog) => {
    const dietLog = dietLogToDelete ?? operatingDietLog;

    if (dietLog.id === 0) return;

    const newLatestDietLog = await deleteDietLog(dietLog);

    if (newLatestDietLog === undefined) return;

    toast.success("Diet Log Entry Deleted");
    deleteModal.onClose();
  };

  const addDietLogEntries = async (
    startDate: Date,
    endDate: Date,
    overwriteExistingDietLogs: boolean,
    dietLog: DietLog
  ) => {
    await addDietLogEntryRange(
      startDate,
      endDate,
      overwriteExistingDietLogs,
      dietLog
    );

    dietLogModal.onClose();
    toast.success("Diet Log Entries Added");
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
    if (userSettings === undefined) return;

    if (key === "edit") {
      setOperationType("edit");
      setOperatingDietLog(dietLog);
      dietLogModal.onOpen();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteDietLogEntry(dietLog);
    } else if (key === "delete") {
      setOperationType("delete");
      setOperatingDietLog(dietLog);
      deleteModal.onOpen();
    }
  };

  const handleAddDietLogEntry = (isRange: boolean) => {
    if (operationType !== "add") {
      setOperationType("add");
      setOperatingDietLog(defaultDietLog);
      setDateEntryType(isRange ? "range" : "custom");
    }

    dietLogModal.onOpen();
  };

  if (userSettings === undefined || !isDietLogListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Diet Log Entry"
        body={
          <p>
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
      <DietLogModal
        dietLogModal={dietLogModal}
        dietLog={operatingDietLog}
        dateEntryType={dateEntryType}
        setDateEntryType={setDateEntryType}
        dietLogMap={dietLogMap}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        isEditing={operationType === "edit"}
        doneButtonAction={
          operationType === "edit" ? updateDietLogEntry : addDietLogEntry
        }
        saveRangeButtonAction={addDietLogEntries}
      />
      <FilterDietLogListModal
        useDietLogList={dietLogList}
        userSettings={userSettings}
      />
      <div className="flex flex-col items-center gap-1.5">
        <ListPageSearchInput
          header="Diet Logs"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredDietLogs.length}
          totalListLength={dietLogs.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <div className="flex gap-1">
                  <Button
                    color="secondary"
                    variant="flat"
                    onPress={() => handleAddDietLogEntry(false)}
                    size="sm"
                  >
                    New Diet Log Entry
                  </Button>
                  <Button
                    color="secondary"
                    variant="flat"
                    onPress={() => handleAddDietLogEntry(true)}
                    size="sm"
                  >
                    Add Multiple
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    className="z-1"
                    variant="flat"
                    color={filterMap.size > 0 ? "secondary" : "default"}
                    size="sm"
                    onPress={() => filterDietLogListModal.onOpen()}
                  >
                    Filter
                  </Button>
                  <Dropdown shouldBlockScroll={false}>
                    <DropdownTrigger>
                      <Button className="z-1" variant="flat" size="sm">
                        Sort By
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Sort Diet Logs Dropdown Menu"
                      selectionMode="single"
                      selectedKeys={[sortCategory]}
                      onAction={(key) =>
                        handleSortOptionSelection(key as string)
                      }
                    >
                      <DropdownItem key="date-desc">
                        Date (Latest First)
                      </DropdownItem>
                      <DropdownItem key="date-asc">
                        Date (Oldest First)
                      </DropdownItem>
                      <DropdownItem key="calories-desc">
                        Calories (Highest First)
                      </DropdownItem>
                      <DropdownItem key="calories-asc">
                        Calories (Lowest First)
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
              {filterMap.size > 0 && (
                <ListFilters
                  filterMap={filterMap}
                  removeFilter={removeFilter}
                  prefixMap={prefixMap}
                />
              )}
            </div>
          }
        />
        <DietLogAccordions
          dietLogEntries={filteredDietLogs}
          handleDietLogAccordionClick={handleDietLogAccordionClick}
          handleDietLogOptionSelection={handleDietLogOptionSelection}
        />
      </div>
    </>
  );
}
