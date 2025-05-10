import { GetCurrentYmdDateString, GetYesterdayYmdDateString } from "..";

export const IsYmdDateStringTodayOrYesterday = (dateString: string) => {
  // returns 1 if dateString is today
  // returns 2 if dateString is yesterday
  // returns 0 if dateString is neither today or yesterday

  const ymdDateToday = GetCurrentYmdDateString();

  if (dateString === ymdDateToday) return 1;

  const ymdDateYesterday = GetYesterdayYmdDateString();

  if (dateString === ymdDateYesterday) return 2;

  return 0;
};
