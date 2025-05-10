import { IsStringEmpty } from "..";

export const ConvertInputStringToNumberOrNull = (str: string) => {
  if (IsStringEmpty(str)) return null;

  return Number(str);
};
