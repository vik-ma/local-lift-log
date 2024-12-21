import { getLocalTimeZone } from "@internationalized/date";
import { CalendarDate } from "@nextui-org/react";

export const IsDateWithinLimit = (
  dateISOString: string,
  dateLimit: CalendarDate | null,
  isMaxDate: boolean
) => {
  if (dateLimit === null) return true;

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
