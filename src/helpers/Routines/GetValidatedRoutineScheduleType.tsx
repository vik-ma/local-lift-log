import { ROUTINE_SCHEDULE_TYPES } from "../../constants";

export const GetValidatedRoutineScheduleType = (
  routineScheduleType: number
) => {
  if (ROUTINE_SCHEDULE_TYPES.has(routineScheduleType))
    return routineScheduleType;

  return 0;
};
