import { CalendarMonthItem } from "../../typings";

export const GetCalendarDateMarkingColorIndex = (
  calendarDateMarking: string,
  workoutTemplateId: number,
  operatingCalendarMonth: CalendarMonthItem,
  workoutIndex: number
) => {
  return calendarDateMarking === "workout-templates"
    ? operatingCalendarMonth.workoutTemplateMap.get(workoutTemplateId)!.index
    : calendarDateMarking === "active-routine"
    ? operatingCalendarMonth.routineWorkoutTemplateMap.get(workoutTemplateId)!
        .index
    : workoutIndex;
};
