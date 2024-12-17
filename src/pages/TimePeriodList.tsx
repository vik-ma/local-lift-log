import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import {
  EmptyListLabel,
  ListPageSearchInput,
  LoadingSpinner,
  TimePeriodModal,
} from "../components";
import {
  useDefaultTimePeriod,
  useTimePeriodInputs,
  useTimePeriodList,
} from "../hooks";
import { useEffect, useState } from "react";
import { TimePeriod, UserSettings } from "../typings";
import { ConvertEmptyStringToNull, GetUserSettings } from "../helpers";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";
import { VerticalMenuIcon } from "../assets";

type OperationType = "add" | "edit" | "delete";

export default function TimePeriodList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultTimePeriod = useDefaultTimePeriod();

  const [operatingTimePeriod, setOperatingTimePeriod] =
    useState<TimePeriod>(defaultTimePeriod);

  const timePeriodModal = useDisclosure();

  const timePeriodInputs = useTimePeriodInputs(operatingTimePeriod);

  const { isTimePeriodValid, startDateString, endDateString } =
    timePeriodInputs;

  const timePeriodList = useTimePeriodList(true);

  const {
    timePeriods,
    setTimePeriods,
    filteredTimePeriods,
    filterQuery,
    setFilterQuery,
    isTimePeriodListLoaded,
  } = timePeriodList;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  const addTimePeriod = async () => {
    if (!isTimePeriodValid || operationType !== "add") return;

    const noteToInsert = ConvertEmptyStringToNull(operatingTimePeriod.note);

    const newTimePeriod: TimePeriod = {
      ...operatingTimePeriod,
      start_date: startDateString,
      end_date: endDateString,
      note: noteToInsert,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into time_periods 
         (name, start_date, end_date, note, injury, caloric_intake)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newTimePeriod.name,
          newTimePeriod.start_date,
          newTimePeriod.end_date,
          newTimePeriod.note,
          newTimePeriod.injury,
          newTimePeriod.caloric_intake,
        ]
      );

      newTimePeriod.id = result.lastInsertId;

      setTimePeriods([...timePeriods, newTimePeriod]);

      resetOperatingTimePeriod();
      timePeriodModal.onClose();
      toast.success("Time Period Created");
    } catch (error) {
      console.log(error);
    }
  };

  const resetOperatingTimePeriod = () => {
    setOperationType("add");
    setOperatingTimePeriod(defaultTimePeriod);
  };

  const handleCreateNewTimePeriodButton = () => {
    if (operationType !== "add") {
      resetOperatingTimePeriod();
    }
    timePeriodModal.onOpen();
  };

  if (userSettings === undefined || !isTimePeriodListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <TimePeriodModal
        timePeriodModal={timePeriodModal}
        timePeriod={operatingTimePeriod}
        setTimePeriod={setOperatingTimePeriod}
        useTimePeriodInputs={timePeriodInputs}
        userSettings={userSettings}
        buttonAction={addTimePeriod}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Time Period List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredTimePeriods.length}
          totalListLength={timePeriods.length}
          // TODO: CHANGE IF ADDING FILTERS
          isListFiltered={false}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleCreateNewTimePeriodButton}
                  size="sm"
                >
                  New Time Period
                </Button>
              </div>
            </div>
          }
        />
        {filteredTimePeriods.map((timePeriod) => (
          <div
            className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            onClick={() => {}}
          >
            <div className="flex flex-col justify-start items-start">
              <span className="w-[20.75rem] truncate text-left">
                {timePeriod.name}
              </span>
              <span className="text-xs text-secondary text-left">
                {timePeriod.start_date} - {timePeriod.end_date}
              </span>
              <span className="w-[20.75rem] break-all text-xs text-stone-400 text-left">
                {timePeriod.note}
              </span>
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  aria-label={`Toggle ${timePeriod.name} Time Period Options Menu`}
                  isIconOnly
                  className="z-1"
                  radius="lg"
                  variant="light"
                >
                  <VerticalMenuIcon size={19} color="#888" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label={`Option Menu For ${timePeriod.name} Time Period`}
                // onAction={(key) =>
                //   handleTimePeriodOptionSelection(key as string, timePeriod)
                // }
              >
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="delete" className="text-danger">
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ))}
        {filteredTimePeriods.length === 0 && (
          <EmptyListLabel itemName="Time Periods" />
        )}
      </div>
    </>
  );
}
