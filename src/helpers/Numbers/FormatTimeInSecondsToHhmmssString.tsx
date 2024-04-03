import { IsNumberNegativeOrInfinity } from "..";

export const FormatTimeInSecondsToHhmmssString = (
  time_in_seconds: number
): string => {
  if (IsNumberNegativeOrInfinity(time_in_seconds)) return "Invalid Time";

  const hours = Math.floor(time_in_seconds / 3600);
  const minutes = Math.floor((time_in_seconds % 3600) / 60);
  const remainingSeconds = time_in_seconds % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
