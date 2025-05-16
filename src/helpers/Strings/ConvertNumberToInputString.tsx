import { IsNumberValid, IsNumberValidAndAbove0 } from "..";

export const ConvertNumberToInputString = (num: number, allow0?: boolean) => {
  if (allow0 && IsNumberValid(num)) return num.toString();
  if (!allow0 && IsNumberValidAndAbove0(num)) return num.toString();

  return "";
};
