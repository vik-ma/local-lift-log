import { NumberRange } from "../../typings";

export const IsNumDaysInScheduleWithinRange = (
  numDaysInSchedule: number,
  numberRange: NumberRange
) => {
  if (numDaysInSchedule < numberRange.start) return false;
  if (numDaysInSchedule > numberRange.end) return false;
  return true;
};
