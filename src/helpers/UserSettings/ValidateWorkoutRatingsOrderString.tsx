import { IsStringEmpty, IsStringInvalidInteger } from "..";

export const ValidateWorkoutRatingsOrderString = (str: string) => {
  if (IsStringEmpty(str)) return false;

  const order = str.split(",");

  if (order.length !== 8) return false;

  const existingNumbers = new Set<string>();

  for (const num of order) {
    if (
      existingNumbers.has(num) ||
      IsStringInvalidInteger(num) ||
      Number(num) < 1 ||
      Number(num) > 8
    )
      return false;

    existingNumbers.add(num);
  }

  return true;
};
