import { useMemo } from "react";

export const useRoutineScheduleTypes = () => {
  const routineScheduleTypes = useMemo(() => ["Weekly", "Custom"], []);
  
  return routineScheduleTypes;
};
