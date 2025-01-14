import { RoutineScheduleTypeMap } from "../../typings";

export const RoutineScheduleTypes = () => {
  const ROUTINE_SCHEDULE_TYPES: RoutineScheduleTypeMap = new Map();
  ROUTINE_SCHEDULE_TYPES.set(0, "Weekly");
  ROUTINE_SCHEDULE_TYPES.set(1, "Custom");
  ROUTINE_SCHEDULE_TYPES.set(2, "No Set Days");

  Object.freeze(ROUTINE_SCHEDULE_TYPES);

  return ROUTINE_SCHEDULE_TYPES;
};
