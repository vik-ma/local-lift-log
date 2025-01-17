import { ConvertNumberToTwoDecimals, IsStringEmpty } from "..";

export const ConvertInputStringToNumberWithTwoDecimalsOrNull = (
  str: string
) => {
  if (IsStringEmpty(str)) return null;

  return ConvertNumberToTwoDecimals(Number(str));
};
