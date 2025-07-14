import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  DeleteModal,
  EmptyListLabel,
  FilterTimePeriodListModal,
  ListFilters,
  ListPageSearchInput,
  LoadingSpinner,
  TimePeriodListOptions,
  TimePeriodModal,
  TimePeriodListItemContent,
} from "../components";
import { useDefaultTimePeriod, useTimePeriodList } from "../hooks";
import { useEffect, useRef, useState } from "react";
import { TimePeriod, UserSettings } from "../typings";
import {
  DeleteItemFromList,
  GetUserSettings,
  UpdateItemInList,
  CreateShownPropertiesSet,
  LoadStore,
} from "../helpers";
import Database from "@tauri-apps/plugin-sql";
import toast from "react-hot-toast";
import { VerticalMenuIcon } from "../assets";
import { Store } from "@tauri-apps/plugin-store";

type OperationType = "add" | "edit" | "delete";

export default function TimePeriodList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultTimePeriod = useDefaultTimePeriod();

  const [operatingTimePeriod, setOperatingTimePeriod] =
    useState<TimePeriod>(defaultTimePeriod);

  const timePeriodModal = useDisclosure();
  const deleteModal = useDisclosure();

  const store = useRef<Store>(null);

  const timePeriodList = useTimePeriodList(store);

  const {
    timePeriods,
    setTimePeriods,
    filteredTimePeriods,
    filterQuery,
    setFilterQuery,
    isTimePeriodListLoaded,
    getTimePeriods,
    sortTimePeriodsByCategory,
    timePeriodListFilters,
    selectedTimePeriodProperties,
    setSelectedTimePeriodProperties,
  } = timePeriodList;

  useEffect(() => {
    const loadUserSettings = async () => {
      await LoadStore(store);

      if (store.current === null) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTimePeriod = async (timePeriod: TimePeriod) => {
    if (
      timePeriod.id !== 0 ||
      operationType !== "add" ||
      userSettings === undefined
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into time_periods 
         (name, start_date, end_date, note, injury, diet_phase)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          timePeriod.name,
          timePeriod.start_date,
          timePeriod.end_date,
          timePeriod.note,
          timePeriod.injury,
          timePeriod.diet_phase,
        ]
      );

      if (result.lastInsertId === undefined) return;

      timePeriod.id = result.lastInsertId;

      sortTimePeriodsByCategory([...timePeriods, timePeriod]);

      resetOperatingTimePeriod();
      timePeriodModal.onClose();
      toast.success("Time Period Created");
    } catch (error) {
      console.log(error);
    }
  };

  const updateTimePeriod = async (timePeriod: TimePeriod) => {
    if (
      timePeriod.id === 0 ||
      operationType !== "edit" ||
      userSettings === undefined
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE time_periods SET 
         name = $1, start_date = $2, end_date = $3, note = $4, injury = $5, 
         diet_phase = $6 
         WHERE id = $7`,
        [
          timePeriod.name,
          timePeriod.start_date,
          timePeriod.end_date,
          timePeriod.note,
          timePeriod.injury,
          timePeriod.diet_phase,
          timePeriod.id,
        ]
      );

      const updatedTimePeriods = UpdateItemInList(timePeriods, timePeriod);

      sortTimePeriodsByCategory(updatedTimePeriods);

      resetOperatingTimePeriod();
      toast.success("Time Period Updated");
      timePeriodModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTimePeriod = async (timePeriodToDelete?: TimePeriod) => {
    const timePeriod = timePeriodToDelete ?? operatingTimePeriod;

    if (timePeriod.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from time_periods WHERE id = $1", [timePeriod.id]);

      const updatedTimePeriods = DeleteItemFromList(timePeriods, timePeriod.id);

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
    if (userSettings === undefined) return;

    if (key === "edit") {
      setOperatingTimePeriod(timePeriod);
      setOperationType("edit");
      timePeriodModal.onOpen();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteTimePeriod(timePeriod);
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
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="text-secondary truncate max-w-[23rem] inline-block align-top">
              {operatingTimePeriod.name}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteTimePeriod}
      />
      <div className="flex flex-col items-center gap-1.5">
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
            <TimePeriodListItemContent
              timePeriod={timePeriod}
              selectedTimePeriodProperties={selectedTimePeriodProperties}
              isInModalList={false}
            />
            <Dropdown shouldBlockScroll={false}>
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
                aria-label={`Options Menu For ${timePeriod.name} Time Period`}
                onAction={(key) =>
                  handleTimePeriodOptionSelection(key as string, timePeriod)
                }
              >
                <DropdownItem key="edit" className="text-slate-400">
                  Edit
                </DropdownItem>
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
