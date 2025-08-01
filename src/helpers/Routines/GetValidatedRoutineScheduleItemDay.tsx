import { IsNumberValidInteger } from "..";

export const GetValidatedRoutineScheduleItemDay = (day: number) => {
  const minValue = 0;
  const doNotAllowMinValue = false;
  const maxValue = 13;

  if (IsNumberValidInteger(day, minValue, doNotAllowMinValue, maxValue))
    return day;

  return 0;
};
