import { useMemo } from "react";
import { NumNewSetsOptionList } from "../helpers";

export const useNumSetsOptions = () => {
  const numSetsOptions = useMemo(() => NumNewSetsOptionList(), []);

  return numSetsOptions;
};
