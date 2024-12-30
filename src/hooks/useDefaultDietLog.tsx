import { useMemo } from "react";
import { DefaultNewDietLog } from "../helpers";

export const useDefaultDietLog = () => {
  const defaultNewDietLog = useMemo(() => DefaultNewDietLog(), []);

  return defaultNewDietLog;
};
