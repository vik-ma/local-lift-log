import { Button, useDisclosure } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { Workout, WorkoutTemplateListItem } from "../typings";
import { GetCurrentYmdDateString } from "../helpers/Dates/GetCurrentYmdDateString";
import Database from "tauri-plugin-sql-api";
import { useState, useEffect } from "react";
import { DefaultNewWorkout } from "../helpers";
import { WorkoutTemplateListModal } from "../components";

export default function WorkoutIndex() {
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);

  const navigate = useNavigate();

  const workoutTemplatesModal = useDisclosure();

  useEffect(() => {
    const getWorkoutTemplates = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplateListItem[]>(
          "SELECT id, name FROM workout_templates"
        );

        const templates: WorkoutTemplateListItem[] = result.map((row) => ({
          id: row.id,
          name: row.name,
        }));

        setWorkoutTemplates(templates);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkoutTemplates();
  }, []);

  const createWorkout = async (workout_template_id: number) => {
    const currentDate: string = GetCurrentYmdDateString();

    const newWorkout: Workout = {
      ...DefaultNewWorkout(),
      workout_template_id: workout_template_id,
      date: currentDate,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into workouts 
        (workout_template_id, date, exercise_order, note, is_loaded, rating) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newWorkout.workout_template_id,
          newWorkout.date,
          newWorkout.exercise_order,
          newWorkout.note,
          newWorkout.is_loaded,
          newWorkout.rating,
        ]
      );

      navigate(`/workouts/${result.lastInsertId}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <WorkoutTemplateListModal
        workoutTemplateListModal={workoutTemplatesModal}
        workoutTemplates={workoutTemplates}
        listboxOnActionFunction={createWorkout}
      />
      <div className="flex flex-col gap-3">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Workouts
          </h1>
        </div>
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col gap-1">
            <Button
              color="success"
              className="font-medium text-lg w-72"
              onPress={() => createWorkout(0)}
            >
              New Empty Workout
            </Button>
            <Button
              color="success"
              className="font-medium text-lg w-72"
              onPress={() => workoutTemplatesModal.onOpen()}
            >
              New Workout From Template
            </Button>
          </div>
          <Button
            className="font-medium text-lg w-72"
            onPress={() => navigate(`/workouts/list`)}
          >
            Workout List
          </Button>
        </div>
      </div>
    </>
  );
}
