import { CalendarDate } from "@nextui-org/react";

export const IsEndDateBeforeStartDate = (
  startDate: CalendarDate,
  endDate: CalendarDate | null
) => {
  if (endDate === null) return false;

  return endDate.compare(startDate) < 0;
};
