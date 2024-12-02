import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Routine, UserSettings } from "../typings";
import toast, { Toaster } from "react-hot-toast";
import Database from "tauri-plugin-sql-api";
import {
  UpdateActiveRoutineId,
  ConvertEmptyStringToNull,
  UpdateRoutine,
  DeleteItemFromList,
  UpdateItemInList,
  FormatNumItemsString,
  GetUserSettings,
} from "../helpers";
import {
  LoadingSpinner,
  DeleteModal,
  RoutineModal,
  ListPageSearchInput,
  EmptyListLabel,
  RoutineListOptions,
  FilterRoutineListModal,
} from "../components";
import {
  useDefaultRoutine,
  useExerciseList,
  useIsRoutineValid,
  useRoutineList,
  useWorkoutTemplateList,
} from "../hooks";
import { VerticalMenuIcon } from "../assets";

type OperationType = "add" | "edit" | "delete";

export default function RoutineList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");

  const navigate = useNavigate();

  const defaultRoutine = useDefaultRoutine();

  const [operatingRoutine, setOperatingRoutine] =
    useState<Routine>(defaultRoutine);

  const deleteModal = useDisclosure();
  const routineModal = useDisclosure();

  const { isRoutineNameValid, isRoutineValid } =
    useIsRoutineValid(operatingRoutine);

  const exerciseList = useExerciseList(true, true);

  const workoutTemplateList = useWorkoutTemplateList(true, exerciseList, true);

  const routineList = useRoutineList(true, workoutTemplateList);

  const {
    routines,
    setRoutines,
    filteredRoutines,
    filterQuery,
    setFilterQuery,
    isRoutineListLoaded,
  } = routineList;

  useEffect(() => {
    const getActiveRoutineId = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings !== undefined) {
        setUserSettings(userSettings);
      }
    };

    getActiveRoutineId();
  }, []);

  const handleSetActiveButton = async (routine: Routine) => {
    if (userSettings === undefined) return;

    const newActiveRoutineId =
      routine.id === userSettings.active_routine_id ? 0 : routine.id;

    const updatedSettings = {
      ...userSettings,
      active_routine_id: newActiveRoutineId,
    };

    await UpdateActiveRoutineId(updatedSettings);
    setUserSettings(updatedSettings);
  };

  const handleRoutineOptionSelection = (key: string, routine: Routine) => {
    if (key === "edit") {
      setOperationType("edit");
      setOperatingRoutine(routine);
      routineModal.onOpen();
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

    const noteToInsert = ConvertEmptyStringToNull(operatingRoutine.note);

    const newRoutine: Routine = {
      ...operatingRoutine,
      note: noteToInsert,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into routines (name, note, is_schedule_weekly, num_days_in_schedule, custom_schedule_start_date) VALUES ($1, $2, $3, $4, $5)",
        [
          newRoutine.name,
          newRoutine.note,
          newRoutine.is_schedule_weekly,
          newRoutine.num_days_in_schedule,
          newRoutine.custom_schedule_start_date,
        ]
      );

      newRoutine.id = result.lastInsertId;

      setRoutines([...routines, newRoutine]);

      resetOperatingRoutine();
      routineModal.onClose();
      toast.success("Routine Created");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteRoutine = async () => {
    if (
      operatingRoutine.id === 0 ||
      operationType !== "delete" ||
      userSettings === undefined
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from routines WHERE id = $1", [operatingRoutine.id]);

      // Delete all workout_routine_schedules referencing routine
      db.execute(
        "DELETE from workout_routine_schedules WHERE routine_id = $1",
        [operatingRoutine.id]
      );

      const updatedRoutines = DeleteItemFromList(routines, operatingRoutine.id);

      setRoutines(updatedRoutines);

      if (operatingRoutine.id === userSettings.active_routine_id) {
        const updatedSettings = {
          ...userSettings,
          active_routine_id: 0,
        };

        await UpdateActiveRoutineId(updatedSettings);
        setUserSettings(updatedSettings);
      }

      toast.success("Routine Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingRoutine();
    deleteModal.onClose();
  };

  const updateRoutine = async () => {
    if (!isRoutineValid) return;

    const noteToInsert = ConvertEmptyStringToNull(operatingRoutine.note);

    const updatedRoutine: Routine = {
      ...operatingRoutine,
      note: noteToInsert,
    };

    const success = await UpdateRoutine(updatedRoutine);

    if (!success) return;

    const updatedRoutines = UpdateItemInList(routines, updatedRoutine);

    setRoutines(updatedRoutines);

    resetOperatingRoutine();
    toast.success("Routine Updated");
    routineModal.onClose();
  };

  const resetOperatingRoutine = () => {
    setOperationType("add");
    setOperatingRoutine(defaultRoutine);
  };

  const handleCreateNewRoutineButton = () => {
    if (operationType !== "add") {
      resetOperatingRoutine();
    }
    routineModal.onOpen();
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
          <p className="break-words">
            Are you sure you want to permanently delete {operatingRoutine?.name}
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
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Routine List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredRoutines.length}
          totalListLength={routines.length}
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
              {/* TODO: ADD LISTFILTERS */}
            </div>
          }
        />
        {!isRoutineListLoaded.current ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 w-full">
              {filteredRoutines.map((routine) => {
                const isActiveRoutine =
                  userSettings.active_routine_id === routine.id;
                const numWorkoutTemplates = routine.numWorkoutTemplates ?? 0;
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
                        {routine.is_schedule_weekly === 0
                          ? `${routine.num_days_in_schedule} Day Schedule`
                          : "Weekly Schedule"}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 pr-1">
                      <Button
                        className="w-[5.25rem]"
                        color={isActiveRoutine ? "success" : "default"}
                        variant="flat"
                        size="sm"
                        onPress={() => handleSetActiveButton(routine)}
                      >
                        {isActiveRoutine ? "Active" : "Set Active"}
                      </Button>
                      <Dropdown>
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
                          aria-label={`Option Menu For ${routine.name} Routine`}
                          onAction={(key) =>
                            handleRoutineOptionSelection(key as string, routine)
                          }
                        >
                          <DropdownItem key="edit">Edit</DropdownItem>
                          <DropdownItem
                            key="set-active"
                            className={isActiveRoutine ? "" : "text-success"}
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
          </>
        )}
      </div>
    </>
  );
}
