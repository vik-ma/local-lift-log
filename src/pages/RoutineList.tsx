import { Button, Input } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useState } from "react";
import Database from "tauri-plugin-sql-api";
import { Routine } from "../typings";

export default function RoutineListPage() {
  const getRoutines = async () => {
    try {
      const databaseUrl: string = import.meta.env.VITE_DATABASE_URL_FULL;
      const db = await Database.load(databaseUrl);

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

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    if (inputValue === "") return;

    navigate(`/routines/${inputValue}`);
  };

  const [routines, setRoutines] = useState<Routine[]>([]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Routines
          </h1>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Input
            type="text"
            label="Id"
            placeholder="Enter Routine Id"
            onChange={handleInputChange}
          />
          <Button
            className="text-lg"
            size="lg"
            color="primary"
            onClick={handleButtonClick}
          >
            OK
          </Button>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Button
            className="text-lg"
            size="lg"
            color="primary"
            onClick={getRoutines}
          >
            Get Routines
          </Button>
          <div>
            {routines.map((routine, index) => (
              <h1 key={`routine-${index}`}>{routine.name}</h1>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
