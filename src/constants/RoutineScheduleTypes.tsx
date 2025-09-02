import { RoutineScheduleTypeMap } from "../typings";

export const ROUTINE_SCHEDULE_TYPES: RoutineScheduleTypeMap = Object.freeze(
  new Map([
    [0, "Weekly"],
    [1, "Custom"],
    [2, "No Set Days"],
  ])
);
