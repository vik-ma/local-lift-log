import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { Workout } from "../typings";
import { GetCurrentYmdDateString } from "../helpers/Dates/GetCurrentYmdDateString";
import Database from "tauri-plugin-sql-api";

export default function WorkoutIndex() {
  const navigate = useNavigate();

  const handleNewEmptyWorkoutPress = async () => {
    const currentDate: string = GetCurrentYmdDateString();

    const newWorkout: Workout = {
      id: 0,
      workout_template_id: 0,
      date: currentDate,
      set_list_order: "",
      note: null,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into workouts (workout_template_id, date, set_list_order, note) VALUES ($1, $2, $3, $4)",
        [
          newWorkout.id,
          newWorkout.workout_template_id,
          newWorkout.date,
          newWorkout.set_list_order,
          newWorkout.note,
        ]
      );

      navigate(`/workouts/${result.lastInsertId}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Workouts
          </h1>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          <Button
            size="lg"
            color="success"
            className="font-medium text-xl"
            onPress={handleNewEmptyWorkoutPress}
          >
            New Empty Workout
          </Button>
          <Button size="lg" color="success" className="font-medium text-xl">
            New Workout From Template
          </Button>
          <Button
            size="lg"
            color="primary"
            className="font-medium text-xl"
            onPress={() => navigate(`/workouts/list`)}
          >
            Workout List
          </Button>
        </div>
      </div>
    </>
  );
}
