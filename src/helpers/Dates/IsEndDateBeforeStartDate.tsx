import { CalendarDate } from "@heroui/react";

export const IsEndDateBeforeStartDate = (
  startDate: CalendarDate,
  endDate: CalendarDate | null
) => {
  if (endDate === null) return false;

  return endDate.compare(startDate) < 0;
};
