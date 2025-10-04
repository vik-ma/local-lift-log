export const FormatRoutineScheduleTypeString = (
  scheduleType: string,
  numDaysInSchedule: number
) => {
  if (scheduleType === "Weekly") return "Weekly Schedule";

  if (scheduleType === "Custom") return `${numDaysInSchedule} Day Schedule`;

  if (scheduleType === "No Set Days") return "Schedule With No Set Days";

  return "";
};
