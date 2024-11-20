import { CalendarDate, RangeValue } from "@nextui-org/react";

export const CalculateNumDaysInCalendarDateRange = (
  dateRange: RangeValue<CalendarDate> | null
) => {
  if (dateRange === null) return 0;

  try {
    const startDateTime = new Date(dateRange.start.toString()).getTime();
    const endDateTime = new Date(dateRange.end.toString()).getTime();

    const numDays = (endDateTime - startDateTime) / (1000 * 60 * 60 * 24) + 1;

    return numDays;
  } catch {
    return 0;
  }
};
