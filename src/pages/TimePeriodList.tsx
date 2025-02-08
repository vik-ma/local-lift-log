import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  CaloricIntakeTypeSpan,
  DeleteModal,
  EmptyListLabel,
  FilterTimePeriodListModal,
  ListFilters,
  ListPageSearchInput,
  LoadingSpinner,
  TimePeriodListOptions,
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
  UpdateItemInList,
  ConvertISODateStringToCalendarDate,
  IsDatePassed,
  CreateShownPropertiesSet,
} from "../helpers";
import Database from "tauri-plugin-sql-api";
import toast from "react-hot-toast";
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
    sortTimePeriodByActiveCategory,
    timePeriodListFilters,
    selectedTimePeriodProperties,
    setSelectedTimePeriodProperties,
  } = timePeriodList;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
      getTimePeriods(userSettings.locale);

      const timePeriodPropertySet = CreateShownPropertiesSet(
        userSettings.shown_time_period_properties,
        "time-period"
      );
      setSelectedTimePeriodProperties(timePeriodPropertySet);
    };

    loadUserSettings();
  }, []);

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

    const isOngoing = endDateString === null || !IsDatePassed(endDateString);

    const newTimePeriod: TimePeriod = {
      ...operatingTimePeriod,
      start_date: startDateString,
      end_date: endDateString,
      note: noteToInsert,
      formattedStartDate,
      formattedEndDate,
      isOngoing,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into time_periods 
         (name, start_date, end_date, note, injury, diet_phase)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newTimePeriod.name,
          newTimePeriod.start_date,
          newTimePeriod.end_date,
          newTimePeriod.note,
          newTimePeriod.injury,
          newTimePeriod.diet_phase,
        ]
      );

      newTimePeriod.id = result.lastInsertId;

      sortTimePeriodByActiveCategory([...timePeriods, newTimePeriod]);

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

    const isOngoing = endDateString === null || !IsDatePassed(endDateString);

    const updatedTimePeriod: TimePeriod = {
      ...operatingTimePeriod,
      start_date: startDateString,
      end_date: endDateString,
      note: noteToInsert,
      formattedStartDate,
      formattedEndDate,
      isOngoing,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE time_periods SET 
         name = $1, start_date = $2, end_date = $3, note = $4, injury = $5, 
         diet_phase = $6 
         WHERE id = $7`,
        [
          updatedTimePeriod.name,
          updatedTimePeriod.start_date,
          updatedTimePeriod.end_date,
          updatedTimePeriod.note,
          updatedTimePeriod.injury,
          updatedTimePeriod.diet_phase,
          updatedTimePeriod.id,
        ]
      );

      const updatedTimePeriods = UpdateItemInList(
        timePeriods,
        updatedTimePeriod
      );

      sortTimePeriodByActiveCategory(updatedTimePeriods);

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
      setStartDate(ConvertISODateStringToCalendarDate(timePeriod.start_date));
      setEndDate(ConvertISODateStringToCalendarDate(timePeriod.end_date));
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
      <FilterTimePeriodListModal
        useTimePeriodList={timePeriodList}
        locale={userSettings.locale}
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
          isListFiltered={timePeriodListFilters.filterMap.size > 0}
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
                <TimePeriodListOptions
                  useTimePeriodList={timePeriodList}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                />
              </div>
              {timePeriodListFilters.filterMap.size > 0 && (
                <ListFilters
                  filterMap={timePeriodListFilters.filterMap}
                  removeFilter={timePeriodListFilters.removeFilter}
                  prefixMap={timePeriodListFilters.prefixMap}
                />
              )}
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
              <div className="flex gap-1 items-baseline">
                <span
                  className={
                    timePeriod.isOngoing &&
                    selectedTimePeriodProperties.has("ongoing")
                      ? "max-w-[16.75rem] truncate text-stone-600"
                      : "max-w-[20.75rem] truncate text-stone-600"
                  }
                >
                  {timePeriod.name}
                </span>
                {timePeriod.isOngoing &&
                  selectedTimePeriodProperties.has("ongoing") && (
                    <span className="text-sm text-orange-400">(Ongoing)</span>
                  )}
              </div>
              <div className="text-xs text-left max-w-[20.75rem] truncate">
                <span className="text-secondary">
                  <span className="font-medium text-stone-500">
                    Start Date:{" "}
                  </span>
                  {timePeriod.formattedStartDate}
                </span>
                {timePeriod.formattedEndDate && (
                  <span className="text-secondary">
                    <span className="font-medium text-stone-500 pl-0.5">
                      {" "}
                      End Date:{" "}
                    </span>
                    {timePeriod.formattedEndDate}
                  </span>
                )}
                <span className="text-slate-400 pl-1">
                  ({timePeriod.numDaysBetweenDates} Days)
                </span>
              </div>
              {selectedTimePeriodProperties.has("diet_phase") && (
                <CaloricIntakeTypeSpan value={timePeriod.diet_phase} />
              )}
              {selectedTimePeriodProperties.has("note") && (
                <span className="w-[20.75rem] break-all text-xs text-stone-400 text-left">
                  {timePeriod.note}
                </span>
              )}
              {timePeriod.injury !== null &&
                selectedTimePeriodProperties.has("injury") && (
                  <span className="w-[20.75rem] break-all text-xs text-red-600">
                    <span className="font-medium text-red-800">Injury: </span>
                    {timePeriod.injury}
                  </span>
                )}
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
