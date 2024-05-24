import { useMemo } from "react";
import { DefaultNewRoutine } from "../helpers";

export const useDefaultRoutine = () => {
  const defaultNewRoutine = useMemo(() => DefaultNewRoutine(), []);

  return defaultNewRoutine;
};
