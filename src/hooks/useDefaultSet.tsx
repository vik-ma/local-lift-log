import { useMemo } from "react";
import { DefaultNewSet } from "../helpers";

export const useDefaultSet = (isTemplate: boolean) => {
  const defaultNewSet = useMemo(() => DefaultNewSet(isTemplate), [isTemplate]);

  return defaultNewSet;
};
