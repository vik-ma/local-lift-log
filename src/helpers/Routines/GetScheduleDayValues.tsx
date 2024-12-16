import { RoutineScheduleItem } from "../../typings";

export const GetScheduleDayValues = (
  numDaysInSchedule: number,
  schedules: RoutineScheduleItem[]
): RoutineScheduleItem[][] => {
  // Create array where every index represents a day in the schedule
  const scheduleDayValues: RoutineScheduleItem[][] = Array.from(
    { length: numDaysInSchedule },
    () => []
  );

  schedules.forEach((item) => {
    // Push RoutineScheduleItem to corresponding day
    const day = item.day;
    scheduleDayValues[day].push(item);
  });

  return scheduleDayValues;
};
