import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Routine, UserSettings } from "../typings";
import { useDatabaseContext } from "../context/useDatabaseContext";
import UpdateUserSettings from "../helpers/UpdateUserSettings";

export default function RoutineListPage() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>([]);

  const { db, userSettings, setUserSettings } = useDatabaseContext();

  useEffect(() => {
    const getRoutines = async () => {
      try {
        if (db === null) return;

        const result = await db.select<Routine[]>("SELECT * FROM routines");

        const routines: Routine[] = result.map((row) => ({
          id: row.id,
          name: row.name,
          note: row.note,
          is_schedule_weekly: row.is_schedule_weekly,
          num_days_in_schedule: row.num_days_in_schedule,
          custom_schedule_start_date: row.custom_schedule_start_date,
        }));

        setRoutines(routines);
      } catch (error) {
        console.log(error);
      }
    };

    getRoutines();
  }, [db]);

  const handleRoutineButtonClick = (routine: Routine) => {
    if (routine === null) return;

    navigate(`/routines/${routine.id}`, { state: { routine: routine } });
  };

  const handleSetActiveButtonClick = async (routine: Routine) => {
    if (userSettings === null || routine.id === userSettings.active_routine_id)
      return;

    const updatedSettings: UserSettings = {
      ...userSettings,
      active_routine_id: routine.id,
    };

    setUserSettings(updatedSettings);
    await UpdateUserSettings({ userSettings: updatedSettings, db: db! });
  };

  const handleDeleteButtonClick = async (routine: Routine) => {
    if (routine === null) return;

    try {
      if (db === null) return;

      db.execute("DELETE from routines WHERE id = $1", [routine.id]);

      const updatedRoutines: Routine[] = routines.filter(
        (item) => item.id !== routine.id
      );
      setRoutines(updatedRoutines);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Routines
          </h1>
        </div>
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
                  onClick={() => handleRoutineButtonClick(routine)}
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
                onClick={() => handleSetActiveButtonClick(routine)}
              >
                Set Active
              </Button>
              <Button
                color="danger"
                onClick={() => handleDeleteButtonClick(routine)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
