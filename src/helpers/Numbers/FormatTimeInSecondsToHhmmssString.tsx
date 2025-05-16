import { IsNumberValid } from "..";

export const FormatTimeInSecondsToHhmmssString = (
  time_in_seconds: number
): string => {
  if (!IsNumberValid(time_in_seconds)) return "00:00";

  const hours = Math.floor(time_in_seconds / 3600);
  const minutes = Math.floor((time_in_seconds % 3600) / 60);
  const remainingSeconds = time_in_seconds % 60;

  const formattedHours = String(hours);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  if (hours === 0) {
    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
};
