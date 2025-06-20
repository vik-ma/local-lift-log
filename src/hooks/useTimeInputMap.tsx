import { useMemo } from "react";
import { TimeInputMap } from "../helpers";

export const useTimeInputMap = () => {
  const timeInputMap = useMemo(() => {
    return TimeInputMap();
  }, []);

  return timeInputMap;
};
