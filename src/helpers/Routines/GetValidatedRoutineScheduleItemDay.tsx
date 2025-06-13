import { IsNumberValidInteger } from "..";

export const GetValidatedRoutineScheduleItemDay = (day: number) => {
  if (IsNumberValidInteger(day, 0, false, 13)) return day;

  return 0;
};
