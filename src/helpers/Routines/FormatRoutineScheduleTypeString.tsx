export const FormatRoutineScheduleTypeString = (
  scheduleType: number,
  numDaysInSchedule: number,
  isRoutineDetailsLabel?: boolean
) => {
  if (scheduleType === 0) return "Weekly Schedule";

  if (scheduleType === 1) return `${numDaysInSchedule} Day Schedule`;

  if (scheduleType === 2 && isRoutineDetailsLabel) return "Workout Order";

  if (scheduleType === 2) return "Schedule With No Set Days";

  return "";
};
