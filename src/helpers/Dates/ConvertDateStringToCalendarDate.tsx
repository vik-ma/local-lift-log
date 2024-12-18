import { parseDate } from "@internationalized/date";

export const ConvertDateStringToCalendarDate = (dateString: string | null) => {
  if (dateString === null) return null;

  try {
    return parseDate(dateString);
  } catch {
    return null;
  }
};
