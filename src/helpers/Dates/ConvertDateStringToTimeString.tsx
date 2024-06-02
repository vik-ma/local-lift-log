import { parseAbsoluteToLocal } from "@internationalized/date";

export const ConvertDateStringToTimeString = (
  dateISOString: string,
  is24hFormat: boolean
): string => {
  try {
    const locale: string = is24hFormat ? "en-GB" : "en-US";

    const timeString = parseAbsoluteToLocal(dateISOString)
      .toDate()
      .toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "numeric",
        second: "numeric",
        hour12: !is24hFormat,
      });

    return timeString;
  } catch {
    return "Invalid DateTime";
  }
};
