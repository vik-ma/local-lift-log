import { useMemo } from "react";
import { RoutineScheduleTypes } from "../helpers";

export const useRoutineScheduleTypeMap = () => {
  const routineScheduleTypeMap = useMemo(() => RoutineScheduleTypes(), []);

  return routineScheduleTypeMap;
};
