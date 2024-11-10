import { CalendarDate, parseAbsoluteToLocal } from "@internationalized/date";

export const ConvertCalendarDateToLocalizedString = (
  calendarDate: CalendarDate,
  locale: string
) => {
  const localeString =
    locale === "en-GB" || locale === "en-US" ? locale : "en-GB";

  const date = new Date(calendarDate.toString());

  try {
    const dateString = parseAbsoluteToLocal(date.toISOString())
      .toDate()
      .toLocaleDateString(localeString);
    return dateString;
  } catch {
    return "Invalid DateTime";
  }
};
