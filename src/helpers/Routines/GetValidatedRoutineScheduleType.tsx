import { RoutineScheduleTypes } from "../Constants/RoutineScheduleTypes";

export const GetValidatedRoutineScheduleType = (
  routineScheduleType: number
) => {
  const validRoutineScheduleTypes = RoutineScheduleTypes();

  if (validRoutineScheduleTypes.has(routineScheduleType))
    return routineScheduleType;

  return 0;
};
