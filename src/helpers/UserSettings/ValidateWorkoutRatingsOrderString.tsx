import { IsStringEmpty, IsStringInvalidInteger } from "..";

export const ValidateWorkoutRatingsOrderString = (str: string) => {
  if (IsStringEmpty(str)) return false;

  const order = str.split(",");

  if (order.length !== 8) return false;

  for (const num of order) {
    if (IsStringInvalidInteger(num) || Number(num) < 0 || Number(num) > 7)
      return false;
  }

  return true;
};
