import { useMemo } from "react";
import { MultisetTypes } from "../helpers";

export const useMultisetTypeMap = () => {
  const multisetTypeMap = useMemo(() => MultisetTypes(), []);

  return multisetTypeMap;
};
