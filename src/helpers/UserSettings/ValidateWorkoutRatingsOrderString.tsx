import { IsStringEmpty, IsStringInvalidInteger, WorkoutRatingsMap } from "..";

export const ValidateWorkoutRatingsOrderString = (str: string) => {
  if (IsStringEmpty(str)) return false;

  const order = str.split(",");

  if (order.length !== 8) return false;

  const numValues = Object.values(WorkoutRatingsMap()).map((item) => item.num);

  const minNum = Math.min(...numValues);
  const maxNum = Math.max(...numValues);

  const existingNumbers = new Set<string>();

  for (const num of order) {
    if (
      existingNumbers.has(num) ||
      IsStringInvalidInteger(num) ||
      Number(num) < minNum ||
      Number(num) > maxNum
    )
      return false;

    existingNumbers.add(num);
  }

  return true;
};
