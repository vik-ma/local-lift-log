import { useMemo } from "react";
import { WeekdayMap } from "../helpers";

export const useWeekdayMap = () => {
  const weekdayMap = useMemo(() => WeekdayMap(), []);

  return weekdayMap;
};
