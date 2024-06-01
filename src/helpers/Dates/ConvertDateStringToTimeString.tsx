import { ValidateDateString } from "..";

export const ConvertDateStringToTimeString = (
  dateString: string,
  is24hFormat: boolean
): string => {
  if (!ValidateDateString(dateString)) {
    // Current DateTime placeholder if dateString is invalid
    dateString = new Date().toString();
  }

  if (is24hFormat) {
    const timeString: string = dateString.substring(16, 24);
    return timeString;
  }

  const date = new Date(dateString);
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
  return timeString;
};
