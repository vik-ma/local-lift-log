import { Button, useDisclosure } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Routine, RoutineListItem, UserSettingsOptional } from "../typings";
import toast, { Toaster } from "react-hot-toast";
import Database from "tauri-plugin-sql-api";
import {
  UpdateActiveRoutineId,
  GetActiveRoutineId,
  ConvertEmptyStringToNull,
} from "../helpers";
import { LoadingSpinner, DeleteModal, RoutineModal } from "../components";
import { useDefaultRoutine, useIsRoutineValid } from "../hooks";

export default function RoutineListPage() {
  const [routines, setRoutines] = useState<RoutineListItem[]>([]);
  const [routineToDelete, setRoutineToDelete] = useState<RoutineListItem>();
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const defaultNewRoutine = useDefaultRoutine();

  const [newRoutine, setNewRoutine] = useState<Routine>(defaultNewRoutine);

  const deleteModal = useDisclosure();
  const routineModal = useDisclosure();

  const { isRoutineNameValid, isRoutineValid } = useIsRoutineValid(newRoutine);

  useEffect(() => {
    const getRoutines = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Routine[]>(
          "SELECT id, name FROM routines"
        );

        const routines: RoutineListItem[] = result.map((row) => ({
          id: row.id,
          name: row.name,
        }));

        setRoutines(routines);
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

  const handleSetActiveButton = async (routine: RoutineListItem) => {
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

  const handleDeleteButton = (routine: RoutineListItem) => {
    setRoutineToDelete(routine);
    deleteModal.onOpen();
  };

  const addRoutine = async () => {
    if (!isRoutineValid) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert = ConvertEmptyStringToNull(newRoutine.note);

      const result = await db.execute(
        "INSERT into routines (name, note, is_schedule_weekly, num_days_in_schedule, custom_schedule_start_date) VALUES ($1, $2, $3, $4, $5)",
        [
          newRoutine.name,
          noteToInsert,
          newRoutine.is_schedule_weekly,
          newRoutine.num_days_in_schedule,
          newRoutine.custom_schedule_start_date,
        ]
      );

      const newRoutineListItem: RoutineListItem = {
        id: result.lastInsertId,
        name: newRoutine.name,
      };
      setRoutines([...routines, newRoutineListItem]);

      routineModal.onClose();
      setNewRoutine(defaultNewRoutine);

      toast.success("Routine Created");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteRoutine = async () => {
    if (routineToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from routines WHERE id = $1", [routineToDelete.id]);

      // Delete all workout_routine_schedules referencing routine
      db.execute(
        "DELETE from workout_routine_schedules WHERE routine_id = $1",
        [routineToDelete.id]
      );

      const updatedRoutines: RoutineListItem[] = routines.filter(
        (item) => item.id !== routineToDelete?.id
      );
      setRoutines(updatedRoutines);

      if (routineToDelete.id === userSettings?.active_routine_id) {
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

    setRoutineToDelete(undefined);
    deleteModal.onClose();
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <RoutineModal
        routineModal={routineModal}
        routine={newRoutine}
        setRoutine={setNewRoutine}
        isRoutineNameValid={isRoutineNameValid}
        buttonAction={addRoutine}
        isEditing={false}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Routine"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete {routineToDelete?.name}?
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
            <div className="flex flex-col gap-1.5">
              {routines.map((routine, index) => (
                <div
                  className="flex flex-row justify-stretch gap-1"
                  key={`routine-${index}`}
                >
                  <div className="w-[200px]">
                    <Button
                      className="w-full text-lg font-medium"
                      color="primary"
                      onPress={() => navigate(`/routines/${routine.id}`)}
                    >
                      {routine.name}
                    </Button>
                  </div>
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
                  <Button
                    color="danger"
                    onPress={() => handleDeleteButton(routine)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                className="text-lg font-medium"
                size="lg"
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
