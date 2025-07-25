import { IsStringEmpty } from "..";

export const ConvertInputStringToNumber = (
  str: string,
  startAtMinusOne?: boolean
) => {
  if (IsStringEmpty(str)) return startAtMinusOne ? -1 : 0;

  return Number(str);
};
