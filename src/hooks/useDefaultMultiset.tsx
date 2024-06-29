import { useMemo } from "react";
import { DefaultNewMultiset } from "../helpers";

export const useDefaultMultiset = () => {
  const defaultNewMultiset = useMemo(() => DefaultNewMultiset(), []);

  return defaultNewMultiset;
};
