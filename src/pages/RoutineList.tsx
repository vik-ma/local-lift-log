import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Routine, UserSettings } from "../typings";
import toast from "react-hot-toast";
import Database from "tauri-plugin-sql-api";
import {
  ConvertEmptyStringToNull,
  UpdateRoutine,
  DeleteItemFromList,
  UpdateItemInList,
  FormatNumItemsString,
  GetUserSettings,
  FormatRoutineScheduleTypeString,
  DeleteWorkoutRoutineSchedule,
  CreateRoutineWorkoutTemplateList,
  UpdateUserSetting,
} from "../helpers";
import {
  LoadingSpinner,
  DeleteModal,
  RoutineModal,
  ListPageSearchInput,
  EmptyListLabel,
  RoutineListOptions,
  FilterRoutineListModal,
  ListFilters,
  FilterWorkoutTemplateListModal,
  FilterExerciseGroupsModal,
} from "../components";
import {
  useDefaultRoutine,
  useExerciseList,
  useFilterExerciseList,
  useIsRoutineValid,
  useRoutineList,
  useWorkoutTemplateList,
} from "../hooks";
import { VerticalMenuIcon } from "../assets";

type OperationType = "add" | "edit" | "delete";

export default function RoutineList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [operatingRoutineIndex, setOperatingRoutineIndex] = useState<number>(0);

  const navigate = useNavigate();

  const defaultRoutine = useDefaultRoutine();

  const [operatingRoutine, setOperatingRoutine] =
    useState<Routine>(defaultRoutine);

  const deleteModal = useDisclosure();
  const routineModal = useDisclosure();

  const { isRoutineNameValid, isRoutineValid } =
    useIsRoutineValid(operatingRoutine);

  const exerciseList = useExerciseList(true, true);

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const workoutTemplateList = useWorkoutTemplateList(true, exerciseList, true);

  const { workoutTemplateMap } = workoutTemplateList;

  const routineList = useRoutineList(true, workoutTemplateList);

  const {
    routines,
    setRoutines,
    filteredRoutines,
    filterQuery,
    setFilterQuery,
    isRoutineListLoaded,
    listFilters,
    sortRoutinesByActiveCategory,
  } = routineList;

  const { filterMap } = listFilters;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  const handleSetActiveButton = async (routine: Routine) => {
    if (userSettings === undefined) return;

    const newActiveRoutineId =
      routine.id === userSettings.active_routine_id ? 0 : routine.id;

    await UpdateUserSetting(
      "active_routine_id",
      newActiveRoutineId,
      userSettings,
      setUserSettings
    );
  };

  const handleRoutineOptionSelection = (
    key: string,
    routine: Routine,
    index: number
  ) => {
    if (userSettings === undefined) return;

    if (key === "edit") {
      setOperationType("edit");
      setOperatingRoutine(routine);
      setOperatingRoutineIndex(index);
      routineModal.onOpen();
    } else if (
      key === "delete" &&
      (routine.workoutTemplateIdList?.length === 0 ||
        !!userSettings.never_show_delete_modal)
    ) {
      deleteRoutine(routine);
    } else if (key === "delete") {
      setOperationType("delete");
      setOperatingRoutine(routine);
      deleteModal.onOpen();
    } else if (key === "set-active") {
      handleSetActiveButton(routine);
    }
  };

  const addRoutine = async () => {
    if (!isRoutineValid || operationType !== "add") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert = ConvertEmptyStringToNull(operatingRoutine.note);

      const result = await db.execute(
        `INSERT into routines 
         (name, note, schedule_type, num_days_in_schedule, 
         start_day, workout_template_order) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          operatingRoutine.name,
          noteToInsert,
          operatingRoutine.schedule_type,
          operatingRoutine.num_days_in_schedule,
          operatingRoutine.start_day,
          operatingRoutine.workout_template_order,
        ]
      );

      navigate(`/routines/${result.lastInsertId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteRoutine = async (routineToDelete?: Routine) => {
    const routine = routineToDelete ?? operatingRoutine;

    if (routine.id === 0 || userSettings === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute("DELETE from routines WHERE id = $1", [routine.id]);

      // Delete all workout_routine_schedules referencing routine
      await DeleteWorkoutRoutineSchedule(routine.id, "routine_id");

      const updatedRoutines = DeleteItemFromList(routines, routine.id);

      setRoutines(updatedRoutines);

      if (routine.id === userSettings.active_routine_id) {
        await UpdateUserSetting(
          "active_routine_id",
          0,
          userSettings,
          setUserSettings
        );
      }

      toast.success("Routine Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingRoutine();
    deleteModal.onClose();
  };

  const updateRoutine = async () => {
    if (!isRoutineValid || routines[operatingRoutineIndex] === undefined)
      return;

    const noteToInsert = ConvertEmptyStringToNull(operatingRoutine.note);

    const updatedRoutine: Routine = {
      ...operatingRoutine,
      note: noteToInsert,
    };

    // If switching schedule_type from Weekly/Custom to No Day Set or vice versa
    if (
      (routines[operatingRoutineIndex].schedule_type !== 2 &&
        updatedRoutine.schedule_type === 2) ||
      (routines[operatingRoutineIndex].schedule_type === 2 &&
        updatedRoutine.schedule_type !== 2)
    ) {
      const { workoutTemplateIdList, workoutTemplateIdSet } =
        CreateRoutineWorkoutTemplateList(
          updatedRoutine.schedule_type === 2
            ? `[${operatingRoutine.workout_template_order}]`
            : updatedRoutine.workoutTemplateIds,
          workoutTemplateMap.current
        );

      updatedRoutine.workoutTemplateIdList = workoutTemplateIdList;
      updatedRoutine.workoutTemplateIdSet = workoutTemplateIdSet;
    }

    const success = await UpdateRoutine(updatedRoutine);

    if (!success) return;

    const updatedRoutines = UpdateItemInList(routines, updatedRoutine);

    sortRoutinesByActiveCategory(updatedRoutines);

    resetOperatingRoutine();
    toast.success("Routine Updated");
    routineModal.onClose();
  };

  const resetOperatingRoutine = () => {
    setOperationType("add");
    setOperatingRoutine(defaultRoutine);
    setOperatingRoutineIndex(0);
  };

  const handleCreateNewRoutineButton = () => {
    if (operationType !== "add") {
      resetOperatingRoutine();
    }
    routineModal.onOpen();
  };

  if (userSettings === undefined || !isRoutineListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <RoutineModal
        routineModal={routineModal}
        routine={operatingRoutine}
        setRoutine={setOperatingRoutine}
        isRoutineNameValid={isRoutineNameValid}
        buttonAction={operationType === "edit" ? updateRoutine : addRoutine}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Routine"
        body={
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="text-secondary truncate max-w-[23rem] inline-block align-top">
              {operatingRoutine.name}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteRoutine}
      />
      <FilterRoutineListModal
        useRoutineList={routineList}
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
      />
      <FilterWorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <div className="flex flex-col items-center gap-1.5">
        <ListPageSearchInput
          header="Routine List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredRoutines.length}
          totalListLength={routines.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleCreateNewRoutineButton}
                  size="sm"
                >
                  New Routine
                </Button>
                <RoutineListOptions useRoutineList={routineList} />
              </div>
              {listFilters.filterMap.size > 0 && (
                <ListFilters
                  filterMap={listFilters.filterMap}
                  removeFilter={listFilters.removeFilter}
                  prefixMap={listFilters.prefixMap}
                />
              )}
            </div>
          }
        />
        <div className="flex flex-col gap-1 w-full">
          {filteredRoutines.map((routine, index) => {
            const isActiveRoutine =
              userSettings.active_routine_id === routine.id;
            const numWorkoutTemplates =
              routine.workoutTemplateIdList !== undefined
                ? routine.workoutTemplateIdList.length
                : 0;
            return (
              <div
                className="flex justify-between items-center bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                key={routine.id}
              >
                <button
                  className="flex flex-col justify-start items-start pl-2 py-1"
                  onClick={() => navigate(`/routines/${routine.id}`)}
                >
                  <span className="w-[15.5rem] truncate text-left">
                    {routine.name}
                  </span>
                  {numWorkoutTemplates > 0 && (
                    <span className="text-xs text-secondary text-left">
                      {FormatNumItemsString(numWorkoutTemplates, "Workout")}
                    </span>
                  )}
                  <span className="text-xs text-stone-400 text-left">
                    {FormatRoutineScheduleTypeString(
                      routine.schedule_type,
                      routine.num_days_in_schedule
                    )}
                  </span>
                  <span className="w-[15rem] break-all text-xs text-slate-400 text-left">
                    {routine.note}
                  </span>
                </button>
                <div className="flex items-center gap-1 pr-1">
                  <Button
                    className="w-[5.25rem]"
                    color={isActiveRoutine ? "secondary" : "default"}
                    variant="flat"
                    size="sm"
                    onPress={() => handleSetActiveButton(routine)}
                  >
                    {isActiveRoutine ? "Active" : "Set Active"}
                  </Button>
                  <Dropdown shouldBlockScroll={false}>
                    <DropdownTrigger>
                      <Button
                        aria-label={`Toggle ${routine.name} Options Menu`}
                        isIconOnly
                        className="z-1"
                        radius="lg"
                        variant="light"
                      >
                        <VerticalMenuIcon size={19} color="#888" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label={`Options Menu For ${routine.name} Routine`}
                      onAction={(key) =>
                        handleRoutineOptionSelection(
                          key as string,
                          routine,
                          index
                        )
                      }
                    >
                      <DropdownItem key="edit">Edit</DropdownItem>
                      <DropdownItem
                        key="set-active"
                        className={isActiveRoutine ? "" : "text-secondary"}
                      >
                        {isActiveRoutine ? "Clear Active" : "Set Active"}
                      </DropdownItem>
                      <DropdownItem key="delete" className="text-danger">
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            );
          })}
          {filteredRoutines.length === 0 && (
            <EmptyListLabel itemName="Routines" />
          )}
        </div>
      </div>
    </>
  );
}
