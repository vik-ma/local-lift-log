import { getLocalTimeZone } from "@internationalized/date";
import { CalendarDate } from "@heroui/react";

export const ConvertCalendarDateToYmdString = (
  calendarDate: CalendarDate | null
) => {
  if (calendarDate === null) return null;

  try {
    const date = calendarDate.toDate(getLocalTimeZone());

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const ymdDateString = `${year}-${month}-${day}`;
    
    return ymdDateString;
  } catch {
    return null;
  }
};
