import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import {
  DeleteModal,
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
import {
  ConvertEmptyStringToNull,
  DeleteItemFromList,
  FormatISODateString,
  GetUserSettings,
  ConvertDateStringToCalendarDate,
  UpdateItemInList,
} from "../helpers";
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
  const deleteModal = useDisclosure();

  const timePeriodInputs = useTimePeriodInputs(operatingTimePeriod);

  const {
    isTimePeriodValid,
    startDateString,
    endDateString,
    setStartDate,
    setEndDate,
  } = timePeriodInputs;

  const timePeriodList = useTimePeriodList();

  const {
    timePeriods,
    setTimePeriods,
    filteredTimePeriods,
    filterQuery,
    setFilterQuery,
    isTimePeriodListLoaded,
    getTimePeriods,
  } = timePeriodList;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
      getTimePeriods(userSettings.locale);
    };

    loadUserSettings();
  }, [getTimePeriods]);

  const addTimePeriod = async () => {
    if (
      !isTimePeriodValid ||
      operationType !== "add" ||
      userSettings === undefined
    )
      return;

    const noteToInsert = ConvertEmptyStringToNull(operatingTimePeriod.note);

    const formattedStartDate = FormatISODateString(
      startDateString,
      userSettings.locale
    );
    const formattedEndDate = FormatISODateString(
      endDateString,
      userSettings.locale
    );

    const newTimePeriod: TimePeriod = {
      ...operatingTimePeriod,
      start_date: startDateString,
      end_date: endDateString,
      note: noteToInsert,
      formattedStartDate,
      formattedEndDate,
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

  const updateTimePeriod = async () => {
    if (!isTimePeriodValid || userSettings === undefined) return;

    const noteToInsert = ConvertEmptyStringToNull(operatingTimePeriod.note);

    const formattedStartDate = FormatISODateString(
      startDateString,
      userSettings.locale
    );
    const formattedEndDate = FormatISODateString(
      endDateString,
      userSettings.locale
    );

    const updatedTimePeriod: TimePeriod = {
      ...operatingTimePeriod,
      start_date: startDateString,
      end_date: endDateString,
      note: noteToInsert,
      formattedStartDate,
      formattedEndDate,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE time_periods SET 
         name = $1, start_date = $2, end_date = $3, note = $4, injury = $5, 
         caloric_intake = $6 
         WHERE id = $7`,
        [
          updatedTimePeriod.name,
          updatedTimePeriod.start_date,
          updatedTimePeriod.end_date,
          updatedTimePeriod.note,
          updatedTimePeriod.injury,
          updatedTimePeriod.caloric_intake,
          updatedTimePeriod.id,
        ]
      );

      const updatedTimePeriods = UpdateItemInList(
        timePeriods,
        updatedTimePeriod
      );

      setTimePeriods(updatedTimePeriods);

      resetOperatingTimePeriod();
      toast.success("Time Period Updated");
      timePeriodModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTimePeriod = async () => {
    if (operatingTimePeriod.id === 0 || operationType !== "delete") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from time_periods WHERE id = $1", [
        operatingTimePeriod.id,
      ]);

      const updatedTimePeriods = DeleteItemFromList(
        timePeriods,
        operatingTimePeriod.id
      );

      setTimePeriods(updatedTimePeriods);

      resetOperatingTimePeriod();
      toast.success("Time Period Deleted");
      deleteModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const resetOperatingTimePeriod = () => {
    setOperationType("add");
    setStartDate(null);
    setEndDate(null);
    setOperatingTimePeriod(defaultTimePeriod);
  };

  const handleCreateNewTimePeriodButton = () => {
    if (operationType !== "add") {
      resetOperatingTimePeriod();
    }
    timePeriodModal.onOpen();
  };

  const handleTimePeriodOptionSelection = (
    key: string,
    timePeriod: TimePeriod
  ) => {
    if (key === "edit") {
      setOperatingTimePeriod(timePeriod);
      setStartDate(ConvertDateStringToCalendarDate(timePeriod.start_date));
      setEndDate(ConvertDateStringToCalendarDate(timePeriod.end_date));
      setOperationType("edit");
      timePeriodModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete");
      setOperatingTimePeriod(timePeriod);
      deleteModal.onOpen();
    }
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
        buttonAction={
          operationType === "edit" ? updateTimePeriod : addTimePeriod
        }
      />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Time Period"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete{" "}
            {operatingTimePeriod.name}?
          </p>
        }
        deleteButtonAction={deleteTimePeriod}
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
            key={timePeriod.id}
            className="flex justify-between items-center cursor-pointer w-full bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            onClick={() => handleTimePeriodOptionSelection("edit", timePeriod)}
          >
            <div className="flex flex-col justify-start items-start">
              <span className="w-[20.75rem] truncate text-left">
                {timePeriod.name}
              </span>
              <span className="text-xs text-stone-400 text-left">
                <span className="text-secondary">
                  {timePeriod.formattedStartDate}
                </span>
                {timePeriod.formattedEndDate ? (
                  <span className="text-secondary">
                    {" "}
                    - {timePeriod.formattedEndDate}
                  </span>
                ) : (
                  <span className="text-stone-500"> (Ongoing)</span>
                )}
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
                onAction={(key) =>
                  handleTimePeriodOptionSelection(key as string, timePeriod)
                }
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
