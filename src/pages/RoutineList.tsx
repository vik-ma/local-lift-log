import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Routine, UserSettings } from "../typings";
import toast from "react-hot-toast";
import Database from "@tauri-apps/plugin-sql";
import {
  UpdateRoutine,
  DeleteItemFromList,
  UpdateItemInList,
  FormatNumItemsString,
  GetUserSettings,
  FormatRoutineScheduleTypeString,
  DeleteWorkoutRoutineSchedule,
  CreateRoutineWorkoutTemplateList,
  UpdateUserSetting,
  LoadStore,
  ValidateAndModifyUserSettings,
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
  useRoutineList,
  useWorkoutTemplateList,
} from "../hooks";
import { VerticalMenuIcon } from "../assets";
import { Store } from "@tauri-apps/plugin-store";

type OperationType = "add" | "edit" | "delete";

export default function RoutineList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [operatingRoutineIndex, setOperatingRoutineIndex] = useState<number>(0);

  const store = useRef<Store>(null);

  const navigate = useNavigate();

  const defaultRoutine = useDefaultRoutine();

  const [operatingRoutine, setOperatingRoutine] =
    useState<Routine>(defaultRoutine);

  const deleteModal = useDisclosure();
  const routineModal = useDisclosure();

  const exerciseList = useExerciseList({
    store: store,
    showTotalNumSets: true,
  });

  const workoutTemplateList = useWorkoutTemplateList({
    store: store,
    useExerciseList: exerciseList,
    ignoreEmptyWorkoutTemplates: true,
  });

  const { workoutTemplateMap } = workoutTemplateList;

  const routineList = useRoutineList({
    store: store,
    useExerciseList: exerciseList,
    useWorkoutTemplateList: workoutTemplateList,
  });

  const {
    routines,
    setRoutines,
    filteredRoutines,
    filterQuery,
    setFilterQuery,
    isRoutineListLoaded,
    listFilters,
    sortRoutinesByActiveCategory,
    loadRoutineList,
  } = routineList;

  const { filterMap } = listFilters;

  useEffect(() => {
    const loadPage = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      ValidateAndModifyUserSettings(userSettings, new Set(["locale"]));

      setUserSettings(userSettings);

      await LoadStore(store);

      await loadRoutineList(userSettings);
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    switch (key) {
      case "edit": {
        setOperationType("edit");
        setOperatingRoutine(routine);
        setOperatingRoutineIndex(index);
        routineModal.onOpen();
        break;
      }
      case "delete": {
        if (
          routine.workoutTemplateIdList?.length === 0 ||
          !!userSettings.never_show_delete_modal
        ) {
          deleteRoutine(routine);
        } else {
          setOperationType("delete");
          setOperatingRoutine(routine);
          deleteModal.onOpen();
        }
        break;
      }
      case "set-active": {
        handleSetActiveButton(routine);
        break;
      }
    }
  };

  const addRoutine = async (routine: Routine) => {
    if (operationType !== "add") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into routines 
         (name, note, schedule_type, num_days_in_schedule, 
         start_day, workout_template_order) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          routine.name,
          routine.note,
          routine.schedule_type,
          routine.num_days_in_schedule,
          routine.start_day,
          routine.workout_template_order,
        ]
      );

      if (result.lastInsertId === undefined) return;

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

  const updateRoutine = async (routine: Routine) => {
    if (routines[operatingRoutineIndex] === undefined) return;

    // If switching schedule_type from Weekly/Custom to No Day Set or vice versa
    if (
      (routines[operatingRoutineIndex].schedule_type !== 2 &&
        routine.schedule_type === 2) ||
      (routines[operatingRoutineIndex].schedule_type === 2 &&
        routine.schedule_type !== 2)
    ) {
      const { workoutTemplateIdList, workoutTemplateIdSet } =
        CreateRoutineWorkoutTemplateList(
          routine.schedule_type === 2
            ? `[${operatingRoutine.workout_template_order}]`
            : routine.workoutTemplateIds,
          workoutTemplateMap.current
        );

      routine.workoutTemplateIdList = workoutTemplateIdList;
      routine.workoutTemplateIdSet = workoutTemplateIdSet;
    }

    const success = await UpdateRoutine(routine);

    if (!success) return;

    const updatedRoutines = UpdateItemInList(routines, routine);

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
        buttonAction={operationType === "edit" ? updateRoutine : addRoutine}
        resetInputsAfterSaving
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
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterExerciseGroupsModal useExerciseList={exerciseList} />
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
                <RoutineListOptions
                  useRoutineList={routineList}
                  userSettings={userSettings}
                />
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
                      <DropdownItem key="edit" className="text-slate-400">
                        Edit
                      </DropdownItem>
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
