import { CalendarDate } from "@internationalized/date";

export const IsDateBeforeEpochDate = (date: CalendarDate | null) => {
  if (date === null) return false;

  const epochDate = new CalendarDate(1970, 1, 1);

  return date.compare(epochDate) < 0;
};
