import { CalendarMonthItem, CalendarWorkoutItem } from "../../typings";

export const GetCalendarDateMarkingColorIndex = (
  calendarDateMarking: string,
  workout: CalendarWorkoutItem,
  operatingCalendarMonth: CalendarMonthItem,
  workoutIndex: number
) => {
  return calendarDateMarking === "workout-templates"
    ? operatingCalendarMonth.workoutTemplateMap.get(
        workout.workout_template_id
      )!.index
    : calendarDateMarking === "active-routine"
    ? operatingCalendarMonth.routineWorkoutTemplateMap.get(
        workout.workout_template_id
      )!.index
    : workoutIndex;
};
