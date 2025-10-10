import Database from "@tauri-apps/plugin-sql";
import { Workout, WorkoutWithGroupedSetList } from "../../typings";
import { CreateGroupedWorkoutSetList, GetWorkoutSetList } from "..";
import { EXERCISE_GROUP_DICTIONARY } from "../../constants";

export const GetWorkoutsWithSetListForDate = async (date: Date) => {
  try {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const dateString = date.toISOString();
    const nextDayString = nextDay.toISOString();

    const db = await Database.load(import.meta.env.VITE_DB);

    const workouts = await db.select<Workout[]>(
      `SELECT 
        w.*,         
        CASE 
         WHEN w.workout_template_id = 0 THEN 'No Workout Template'
         WHEN t.id IS NULL THEN 'Unknown'
         ELSE t.name
        END AS workoutTemplateName
       FROM workouts w
       LEFT JOIN workout_templates t 
         ON w.workout_template_id = t.id
       WHERE datetime(w.date) >= datetime('${dateString}')
         AND datetime(w.date) < datetime('${nextDayString}')`
    );

    const workoutsWithGroupedSetList: WorkoutWithGroupedSetList[] = [];

    const getOnlyCompletedSets = true;

    for (const workout of workouts) {
      const setList = await GetWorkoutSetList(workout.id, getOnlyCompletedSets);

      const { groupedSetList } = await CreateGroupedWorkoutSetList(
        setList,
        workout.exercise_order,
        EXERCISE_GROUP_DICTIONARY
      );

      const workoutWithGroupedSetList: WorkoutWithGroupedSetList = {
        workout: workout,
        groupedSetList: groupedSetList,
      };

      console.log(workout)

      workoutsWithGroupedSetList.push(workoutWithGroupedSetList);
    }

    return workoutsWithGroupedSetList;
  } catch (error) {
    console.log(error);
    return [];
  }
};
