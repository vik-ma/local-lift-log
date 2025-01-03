import { IsStringEmpty } from "../Strings/IsStringEmpty";

export const ConvertInputStringToNumberOrNull = (str: string) => {
  if (IsStringEmpty(str)) return null;

  return Number(str);
};
