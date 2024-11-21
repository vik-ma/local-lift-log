import { useMemo } from "react";
import { NumberRange } from "../typings";

export const useDefaultNumberRange = () => {
  const defaultNumberRange: NumberRange = useMemo(() => {
    return { start: 0, end: 0, startInput: "", endInput: "" };
  }, []);

  return defaultNumberRange;
};
