import Database from "@tauri-apps/plugin-sql";
import { Workout, WorkoutWithGroupedSetList } from "../../typings";
import {
  CreateGroupedWorkoutSetList,
  FormatDateString,
  GetWorkoutSetList,
} from "..";
import { EXERCISE_GROUP_DICTIONARY } from "../../constants";

export const GetWorkoutsWithSetListForDate = async (date: Date) => {
  try {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const dateString = date.toISOString();
    const nextDayString = nextDay.toISOString();

    const db = await Database.load(import.meta.env.VITE_DB);

    const workouts = await db.select<Workout[]>(
      `SELECT * FROM workouts
       WHERE datetime(workouts.date) >= datetime('${dateString}')
         AND datetime(workouts.date) < datetime('${nextDayString}')`
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

      workout.formattedDate = FormatDateString(workout.date);

      const workoutWithGroupedSetList: WorkoutWithGroupedSetList = {
        workout: workout,
        groupedSetList: groupedSetList,
      };

      workoutsWithGroupedSetList.push(workoutWithGroupedSetList);
    }

    return workoutsWithGroupedSetList;
  } catch (error) {
    console.log(error);
    return [];
  }
};
