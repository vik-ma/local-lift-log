import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Routine } from "../typings";
import { useDatabaseContext } from "../context/useDatabaseContext";

export default function RoutineListPage() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>([]);

  const { db } = useDatabaseContext();

  useEffect(() => {
    const getRoutines = async () => {
      try {
        if (db === null) throw new Error("Database is not loaded!");

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

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Routines
          </h1>
        </div>
        <div className="flex flex-col gap-1.5 items-stretch">
          {routines.map((routine, index) => (
            <Button
              className="text-lg font-medium"
              color="primary"
              key={`routine-${index}`}
              onClick={() => handleRoutineButtonClick(routine)}
            >
              {routine.name}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
