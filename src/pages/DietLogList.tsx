import { useEffect, useState } from "react";
import {
  DeleteModal,
  DietLogAccordions,
  DietLogModal,
  ListPageSearchInput,
  LoadingSpinner,
} from "../components";
import {
  useDefaultDietLog,
  useDietLogEntryInputs,
  useDietLogList,
} from "../hooks";
import { DietLog, UserSettings } from "../typings";
import { Button, useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  ConvertEmptyStringToNull,
  ConvertInputStringToNumber,
  ConvertInputStringToNumberOrNull,
  FormatYmdDateString,
  GetUserSettings,
  ShouldDietLogDisableExpansion,
} from "../helpers";

type OperationType = "add" | "edit" | "delete";

export default function DietLogList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");

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
    updateDietLog,
    deleteDietLog,
    filterQuery,
    setFilterQuery,
  } = dietLogList;

  const dietLogEntryInputs = useDietLogEntryInputs(true);

  const {
    caloriesInput,
    commentInput,
    fatInput,
    carbsInput,
    proteinInput,
    isDietLogEntryInputValid,
    resetInputs,
    loadDietLogInputs,
  } = dietLogEntryInputs;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();
      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  const updateDietLogEntry = async (date: string) => {
    if (
      operationType !== "edit" ||
      operatingDietLog.id === 0 ||
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
      id: operatingDietLog.id,
      date,
      calories,
      fat,
      carbs,
      protein,
      comment,
      formattedDate,
      isExpanded: false,
      disableExpansion,
    };

    const { success } = await updateDietLog(updatedDietLog);

    if (!success) return;

    resetDietLogEntry();
    dietLogModal.onClose();
    toast.success("Diet Log Entry Updated");
  };

  const deleteDietLogEntry = async () => {
    if (operationType !== "delete" || operatingDietLog.id === 0) return;

    const { success } = await deleteDietLog(operatingDietLog);

    console.log(success);

    if (!success) return;

    toast.success("Diet Log Entry Deleted");
    deleteModal.onClose();
  };

  const resetDietLogEntry = () => {
    setOperationType("add");
    setOperatingDietLog(defaultDietLog);
    resetInputs();
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
      setOperationType("edit");
      setOperatingDietLog(dietLog);
      loadDietLogInputs(dietLog);
      dietLogModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete");
      setOperatingDietLog(dietLog);
      deleteModal.onOpen();
    }
  };

  const handleAddDietLogEntry = () => {
    if (operationType !== "add") {
      resetDietLogEntry();
    }
    dietLogModal.onOpen();
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
      <DietLogModal
        dietLogModal={dietLogModal}
        dietLog={operatingDietLog}
        useDietLogEntryInputs={dietLogEntryInputs}
        dietLogMap={dietLogMap}
        userSettings={userSettings}
        isEditing={operationType === "edit"}
        buttonAction={operationType === "edit" ? updateDietLogEntry : () => {}}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Diet Log Entries"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredDietLogs.length}
          totalListLength={dietLogs.length}
          // TODO: FIX
          isListFiltered={false}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleAddDietLogEntry}
                  size="sm"
                >
                  New Diet Log Entry
                </Button>
                {/* TODO: ADD */}
                {/* <div className="flex gap-1">
                  <Button
                    className="z-1"
                    variant="flat"
                    color={filterMap.size > 0 ? "secondary" : "default"}
                    size="sm"
                    onPress={() => filterUserMeasurementListModal.onOpen()}
                  >
                    Filter
                  </Button>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="z-1" variant="flat" size="sm">
                        Sort By
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Sort User Measurements Dropdown Menu"
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
                    </DropdownMenu>
                  </Dropdown>
                </div> */}
              </div>
              {/* TODO: ADD */}
              {/* {filterMap.size > 0 && (
                <ListFilters
                  filterMap={filterMap}
                  removeFilter={removeFilter}
                  prefixMap={prefixMap}
                />
              )} */}
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
