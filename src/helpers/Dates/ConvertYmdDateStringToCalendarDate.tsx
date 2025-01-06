import { parseDate } from "@internationalized/date";

export const ConvertYmdDateStringToCalendarDate = (ymdDateString: string) => {
  try {
    const date = parseDate(ymdDateString);
    return date;
  } catch {
    return null;
  }
};
