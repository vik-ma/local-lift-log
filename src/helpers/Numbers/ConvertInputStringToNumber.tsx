import { IsStringEmpty } from "../Strings/IsStringEmpty";

export const ConvertInputStringToNumber = (
  str: string,
  startAtMinusOne?: boolean
): number => {
  if (IsStringEmpty(str)) return startAtMinusOne ? -1 : 0;

  return Number(str);
};
