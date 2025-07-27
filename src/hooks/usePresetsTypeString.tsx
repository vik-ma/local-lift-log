import { useMemo } from "react";
import { FormatPresetsTypeString } from "../helpers";
import { PresetsType } from "../typings";

type UsePresetsTypeStringProps = {
  presetsType: PresetsType;
};

export const usePresetsTypeString = ({
  presetsType,
}: UsePresetsTypeStringProps) => {
  const presetsTypeString = useMemo(
    () => FormatPresetsTypeString(presetsType),
    [presetsType]
  );

  return presetsTypeString;
};
