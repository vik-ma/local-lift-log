export const TimeInputMap = () => {
  const TIME_INPUT_MAP: Map<string, string> = new Map([
    ["hhmmss", "HH:MM:SS"],
    ["mmss", "MM:SS"],
    ["minutes", "Minutes"],
    ["seconds", "Seconds"],
  ]);

  Object.freeze(TIME_INPUT_MAP);

  return TIME_INPUT_MAP;
};
