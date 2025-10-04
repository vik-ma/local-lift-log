import Database from "@tauri-apps/plugin-sql";
import { SimpleRoutineScheduleItem, Routine } from "../../typings";
import { IsNumberValidInteger, ValidateAndModifyRoutineSchedule } from "..";

export const GetActiveRoutine = async (activeRoutineId: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Routine[]>(
      `SELECT 
        routines.*,
        json_group_array(
          CASE 
            WHEN workout_routine_schedules.workout_template_id IS NULL 
            THEN NULL
            ELSE json_object(
              'workout_template_id', workout_routine_schedules.workout_template_id,
              'day', workout_routine_schedules.day,
              'name', workout_templates.name
            )
          END
        ) AS routineSchedules
       FROM routines
       LEFT JOIN workout_routine_schedules 
         ON routines.id = workout_routine_schedules.routine_id
       LEFT JOIN workout_templates
         ON workout_routine_schedules.workout_template_id = workout_templates.id
       WHERE routines.id = $1
       GROUP BY routines.id`,
      [activeRoutineId]
    );

    if (result.length === 0) return undefined;

    const activeRoutine = result[0];

    ValidateAndModifyRoutineSchedule(activeRoutine);

    const schedules: (SimpleRoutineScheduleItem | null)[] = JSON.parse(
      activeRoutine.routineSchedules!
    );

    const activeRoutineScheduleList: SimpleRoutineScheduleItem[] = [];

    for (const schedule of schedules) {
      if (schedule === null || schedule.name === null) continue;

      const dayMinValue = 0;
      const doNotAllowMinValue = false;
      const dayMaxValue = activeRoutine.num_days_in_schedule - 1;

      if (
        !IsNumberValidInteger(
          schedule.day,
          dayMinValue,
          doNotAllowMinValue,
          dayMaxValue
        )
      )
        continue;

      activeRoutineScheduleList.push(schedule);
    }

    activeRoutine.routineScheduleList = activeRoutineScheduleList;

    return activeRoutine;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
