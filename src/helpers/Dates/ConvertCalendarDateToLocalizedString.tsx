import { CalendarDate, parseAbsoluteToLocal } from "@internationalized/date";

export const ConvertCalendarDateToLocalizedString = (
  calendarDate: CalendarDate,
  locale: string
) => {
  const date = new Date(calendarDate.toString());

  try {
    const dateString = parseAbsoluteToLocal(date.toISOString())
      .toDate()
      .toLocaleDateString(locale);
    return dateString;
  } catch {
    return "Invalid DateTime";
  }
};
