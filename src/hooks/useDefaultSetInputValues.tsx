import { useMemo } from "react";
import { DefaultSetInputValues } from "../helpers";

export const useDefaultSetInputValues = () => {
  const defaultSetInputValues = useMemo(() => DefaultSetInputValues(), []);

  return defaultSetInputValues;
};
