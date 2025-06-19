import { IsNumberValid, IsNumberValidInteger } from "..";

export const GetValidatedIncrementMultiplier = (
  multiplier: number,
  isInteger?: boolean
) => {
  if (isInteger) {
    if (IsNumberValidInteger(multiplier, 0, true)) return multiplier;
    else return 1;
  }

  if (IsNumberValid(multiplier, 0, true)) return multiplier;

  return 1;
};
