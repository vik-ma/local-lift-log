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
} from "../helpers";
import { LoadingSpinner, DeleteModal, RoutineModal } from "../components";
import { useDefaultRoutine, useIsRoutineValid } from "../hooks";
import { VerticalMenuIcon } from "../assets";

type OperationType = "add" | "edit" | "delete";

export default function RoutineListPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<OperationType>("add");

  const navigate = useNavigate();

  const defaultNewRoutine = useDefaultRoutine();

  const [operatingRoutine, setOperatingRoutine] =
    useState<Routine>(defaultNewRoutine);

  const deleteModal = useDisclosure();
  const routineModal = useDisclosure();

  const { isRoutineNameValid, isRoutineValid } =
    useIsRoutineValid(operatingRoutine);

  useEffect(() => {
    const getRoutines = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Routine[]>("SELECT * FROM routines");

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
    if (
      userSettings === undefined ||
      routine.id === userSettings.active_routine_id
    )
      return;

    const updatedSettings: UserSettingsOptional = {
      ...userSettings,
      active_routine_id: routine.id,
    };

    await updateActiveRoutineId(updatedSettings);
  };

  const updateActiveRoutineId = async (userSettings: UserSettingsOptional) => {
    await UpdateActiveRoutineId(userSettings);
    setUserSettings(userSettings);
  };

  const handleWorkoutOptionSelection = (key: string, routine: Routine) => {
    if (key === "edit") {
    } else if (key === "delete") {
      setOperatingRoutine(routine);
      deleteModal.onOpen();
    } else if (key === "set-active") {
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

      const updatedRoutines: Routine[] = routines.filter(
        (item) => item.id !== operatingRoutine?.id
      );
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

  const resetOperatingRoutine = () => {
    setOperationType("add");
    setOperatingRoutine(defaultNewRoutine);
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
        buttonAction={addRoutine}
        isEditing={false}
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
              {routines.map((routine) => (
                <div
                  className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  key={`${routine.id}`}
                >
                  <button
                    className="flex flex-col justify-start items-start"
                    onClick={() => navigate(`/routines/${routine.id}`)}
                  >
                    <span className="w-[14.5rem] truncate text-left">
                      {routine.name}
                    </span>
                    <span className="text-xs text-stone-500 text-left">
                      {/* TODO: ADD NUM WORKOUTS/DAYS IN SCHEDULE */}
                    </span>
                  </button>
                  <div className="flex gap-1.5 items-center">
                    <Button
                      color="success"
                      variant={
                        userSettings?.active_routine_id === routine.id
                          ? "flat"
                          : "light"
                      }
                      onPress={() => handleSetActiveButton(routine)}
                    >
                      Set Active
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
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
                        aria-label={`Option Menu For Routine ${routine.name}`}
                        onAction={(key) =>
                          handleWorkoutOptionSelection(key as string, routine)
                        }
                      >
                        <DropdownItem key="edit">Edit</DropdownItem>
                        <DropdownItem key="delete" className="text-danger">
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                className=""
                color="success"
                onPress={() => routineModal.onOpen()}
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
