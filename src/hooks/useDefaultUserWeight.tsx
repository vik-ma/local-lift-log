import { useMemo } from "react";
import { DefaultNewUserWeight } from "../helpers";

export const useDefaultUserWeight = () => {
  const defaultNewUserWeight = useMemo(() => DefaultNewUserWeight(), []);

  return defaultNewUserWeight;
};
