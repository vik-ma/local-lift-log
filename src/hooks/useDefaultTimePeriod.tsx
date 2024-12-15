import { useMemo } from "react";
import { DefaultNewTimePeriod } from "../helpers";

export const useDefaultTimePeriod = () => {
  const defaultNewTimePeriod = useMemo(() => DefaultNewTimePeriod(), []);

  return defaultNewTimePeriod;
};
