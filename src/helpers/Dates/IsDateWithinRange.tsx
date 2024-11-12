import { getLocalTimeZone } from "@internationalized/date";
import { CalendarDate, RangeValue } from "@nextui-org/react";

export const IsDateWithinRange = (
  dateISOString: string,
  dateRange: RangeValue<CalendarDate>
) => {
  try {
    const date = new Date(dateISOString);

    const startDate = dateRange.start.toDate(getLocalTimeZone());
    const endDate = dateRange.end.toDate(getLocalTimeZone());
    endDate.setHours(23, 59, 59, 999);

    return date >= startDate && date <= endDate;
  } catch {
    return false;
  }
};
