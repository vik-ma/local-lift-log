import { useMemo } from "react";
import { FormatPresetsTypeString } from "../helpers";
import { PresetsType } from "../typings";

export const usePresetsTypeString = (presetsType: PresetsType) => {
  const presetsTypeString = useMemo(
    () => FormatPresetsTypeString(presetsType),
    [presetsType]
  );

  return presetsTypeString;
};
