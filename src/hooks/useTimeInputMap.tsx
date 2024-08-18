import { useMemo } from "react";

type TimeInputMap = Map<string, string>;

export const useTimeInputMap = () => {
  const timeInputMap = useMemo(() => {
    const timeInputs: TimeInputMap = new Map();
    timeInputs.set("hhmmss", "HH:MM:SS");
    timeInputs.set("mmss", "MM:SS");
    timeInputs.set("minutes", "Minutes");
    timeInputs.set("seconds", "Seconds");

    return timeInputs;
  }, []);

  return timeInputMap;
};
