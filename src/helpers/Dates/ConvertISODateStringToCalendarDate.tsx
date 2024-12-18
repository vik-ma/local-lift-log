import { parseAbsoluteToLocal, toCalendarDate } from "@internationalized/date";

export const ConvertISODateStringToCalendarDate = (
  dateString: string | null
) => {
  if (dateString === null) return null;

  try {
    const zonedDateTime = parseAbsoluteToLocal(dateString);

    const calendarDate = toCalendarDate(zonedDateTime);

    return calendarDate;
  } catch {
    return null;
  }
};
