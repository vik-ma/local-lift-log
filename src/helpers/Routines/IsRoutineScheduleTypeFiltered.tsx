export const IsRoutineScheduleTypeFiltered = (
  scheduleType: number,
  filterScheduleTypes: Set<string>
) => {
  if (scheduleType === 0 && filterScheduleTypes.has("Weekly")) return true;

  if (scheduleType === 1 && filterScheduleTypes.has("Custom")) return true;

  if (scheduleType === 2 && filterScheduleTypes.has("No Set Days")) return true;

  return false;
};
