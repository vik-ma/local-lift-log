import { IsNumberValidInteger } from "..";

export const GetValidatedStartDay = (startDay: number) => {
  const minValue = 0;
  const doNotAllowMinValue = false;
  const maxValue = 6;

  if (IsNumberValidInteger(startDay, minValue, doNotAllowMinValue, maxValue))
    return startDay;

  return 0;
};
