import { IsNumberValidAndAbove0 } from "../Numbers/IsNumberValidAndAbove0";

export const ConvertNumberToInputString = (num: number) => {
  if (IsNumberValidAndAbove0(num)) return num.toString();

  return "";
};
