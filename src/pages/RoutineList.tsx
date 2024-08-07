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
import { Routine, UserSettingsOptional } from "../typings";
import toast, { Toaster } from "react-hot-toast";
import Database from "tauri-plugin-sql-api";
import {
  UpdateActiveRoutineId,
  GetActiveRoutineId,
  ConvertEmptyStringToNull,
  UpdateRoutine,
  DeleteItemFromList,
  UpdateItemInList,
  FormatNumItemsString,
} from "../helpers";
import { LoadingSpinner, DeleteModal, RoutineModal } from "../components";
import { useDefaultRoutine, useIsRoutineValid } from "../hooks";
import { VerticalMenuIcon } from "../assets";

type OperationType = "add" | "edit" | "delete";

export default function RoutineList() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<OperationType>("add");

  const navigate = useNavigate();

  const defaultRoutine = useDefaultRoutine();

  const [operatingRoutine, setOperatingRoutine] =
    useState<Routine>(defaultRoutine);

  const deleteModal = useDisclosure();
  const routineModal = useDisclosure();

  const { isRoutineNameValid, isRoutineValid } =
    useIsRoutineValid(operatingRoutine);

  useEffect(() => {
    const getRoutines = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        // Get all columns and number of workout_routine_schedule entries for every Routine
        const result = await db.select<Routine[]>(
          `SELECT routines.*, 
          COUNT(workout_routine_schedules.routine_id) AS numWorkoutTemplates 
          FROM routines LEFT JOIN workout_routine_schedules
          ON routines.id = workout_routine_schedules.routine_id 
          GROUP BY routines.id`
        );

        setRoutines(result);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    const getActiveRoutineId = async () => {
      const userSettings: UserSettingsOptional | undefined =
        await GetActiveRoutineId();

      if (userSettings !== undefined) setUserSettings(userSettings);
    };

    getActiveRoutineId();
    getRoutines();
  }, []);

  const handleSetActiveButton = async (routine: Routine) => {
    if (userSettings === undefined) return;

    const newActiveRoutineId =
      routine.id === userSettings.active_routine_id ? 0 : routine.id;

    const updatedSettings: UserSettingsOptional = {
      ...userSettings,
      active_routine_id: newActiveRoutineId,
    };

    await updateActiveRoutineId(updatedSettings);
  };

  const updateActiveRoutineId = async (userSettings: UserSettingsOptional) => {
    await UpdateActiveRoutineId(userSettings);
    setUserSettings(userSettings);
  };

  const handleWorkoutOptionSelection = (key: string, routine: Routine) => {
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
    if (operatingRoutine.id === 0 || operationType !== "delete") return;

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

      if (operatingRoutine.id === userSettings?.active_routine_id) {
        const updatedSettings: UserSettingsOptional = {
          ...userSettings,
          active_routine_id: 0,
        };

        await updateActiveRoutineId(updatedSettings);
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
        isEditing={operationType === "edit"}
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

      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Routines
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 w-full">
              {routines.map((routine) => {
                const isActiveRoutine =
                  userSettings.active_routine_id === routine.id;
                const numWorkoutTemplates = routine.numWorkoutTemplates ?? 0;
                return (
                  <div
                    className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                    key={routine.id}
                  >
                    <button
                      className="flex flex-col justify-start items-start"
                      onClick={() => navigate(`/routines/${routine.id}`)}
                    >
                      <span className="w-[14.5rem] truncate text-left">
                        {routine.name}
                      </span>
                      {numWorkoutTemplates > 0 && (
                        <span className="text-xs text-yellow-600 text-left">
                          {FormatNumItemsString(numWorkoutTemplates, "Workout")}
                        </span>
                      )}
                      <span className="text-xs text-stone-400 text-left">
                        {routine.is_schedule_weekly === 0
                          ? `${routine.num_days_in_schedule} Day Schedule`
                          : "Weekly Schedule"}
                      </span>
                    </button>
                    <div className="flex gap-1.5 items-center">
                      <Button
                        className="w-20"
                        size="sm"
                        color={isActiveRoutine ? "success" : "default"}
                        variant="flat"
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
                            size="sm"
                            radius="lg"
                            variant="light"
                          >
                            <VerticalMenuIcon size={17} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label={`Option Menu For ${routine.name} Routine`}
                          onAction={(key) =>
                            handleWorkoutOptionSelection(key as string, routine)
                          }
                        >
                          <DropdownItem
                            key="set-active"
                            className={isActiveRoutine ? "" : "text-success"}
                          >
                            {isActiveRoutine ? "Clear Active" : "Set Active"}
                          </DropdownItem>
                          <DropdownItem key="edit">Edit</DropdownItem>
                          <DropdownItem key="delete" className="text-danger">
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center">
              <Button
                className=""
                color="success"
                onPress={handleCreateNewRoutineButton}
              >
                Create New Routine
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
