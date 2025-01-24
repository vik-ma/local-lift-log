import { getLocalTimeZone } from "@internationalized/date";
import { CalendarDate } from "@heroui/react";

export const IsDateWithinLimit = (
  dateISOString: string | null,
  dateLimit: CalendarDate | null,
  isMaxDate: boolean
) => {
  if (dateLimit === null) return true;

  if (dateISOString === null) return false;

  try {
    const date = new Date(dateISOString);

    const filterDate = dateLimit.toDate(getLocalTimeZone());

    if (isMaxDate) {
      filterDate.setHours(23, 59, 59, 999);

      return date <= filterDate;
    } else {
      return date >= filterDate;
    }
  } catch {
    return false;
  }
};
