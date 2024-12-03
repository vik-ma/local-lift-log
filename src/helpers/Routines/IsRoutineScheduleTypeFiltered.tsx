export const IsRoutineScheduleTypeFiltered = (
  isScheduleWeekly: number,
  filterScheduleTypes: Set<string>
) => {
  if (isScheduleWeekly === 1 && filterScheduleTypes.has("Weekly")) return true;

  if (isScheduleWeekly === 0 && filterScheduleTypes.has("Custom")) return true;

  return false;
};
