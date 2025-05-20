import { ConvertNumberToTwoDecimals, IsStringEmpty } from "..";

export const ConvertInputStringToNumberOrNull = (
  str: string,
  convertToTwoDecimals?: boolean
) => {
  if (IsStringEmpty(str)) return null;

  if (convertToTwoDecimals) return ConvertNumberToTwoDecimals(Number(str));

  return Number(str);
};
