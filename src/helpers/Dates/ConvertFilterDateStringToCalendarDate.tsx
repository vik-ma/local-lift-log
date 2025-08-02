import { CalendarDate } from "@internationalized/date";
import { IsNumberValidInteger } from "../Numbers/IsNumberValidInteger";

export const ConvertFilterDateStringToCalendarDate = (
  dateString: string,
  locale: string
) => {
  const splitDate = dateString.split("/");

  if (splitDate.length !== 3) return null;

  const day = locale === "en-US" ? Number(splitDate[1]) : Number(splitDate[0]);
  const month =
    locale === "en-US" ? Number(splitDate[0]) : Number(splitDate[1]);
  const year = Number(splitDate[2]);

  if (
    !IsNumberValidInteger(day) ||
    !IsNumberValidInteger(month) ||
    !IsNumberValidInteger(year)
  )
    return null;

  const date = new CalendarDate(year, month, day);

  return date;
};
