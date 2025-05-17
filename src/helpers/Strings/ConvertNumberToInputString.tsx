import { IsNumberValid } from "..";

export const ConvertNumberToInputString = (num: number, allow0?: boolean) => {
  if (allow0 && IsNumberValid(num)) return num.toString();
  if (!allow0 && IsNumberValid(num, 0, true)) return num.toString();

  return "";
};
