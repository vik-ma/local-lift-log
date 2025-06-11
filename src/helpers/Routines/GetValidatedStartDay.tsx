import { IsNumberValidInteger } from "..";

export const GetValidatedStartDay = (startDay: number) => {
  if (IsNumberValidInteger(startDay, 0, false, 6)) return startDay;

  return 0;
};
