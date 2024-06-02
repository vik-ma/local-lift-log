import { parseAbsoluteToLocal } from "@internationalized/date";

export const FormatDateTimeString = (
  dateISOString: string,
  is24hFormat: boolean
): string => {
  try {
    const locale: string = is24hFormat ? "en-GB" : "en-US";

    const formattedDate = parseAbsoluteToLocal(dateISOString)
      .toDate()
      .toLocaleDateString(locale, {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "numeric",
        hour12: !is24hFormat,
      })
      .replace(/,/g, "");

    return formattedDate;
  } catch {
    return "Invalid Date";
  }
};
