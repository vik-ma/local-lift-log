import { IsStringEmpty } from "../Strings/IsStringEmpty";

export const ConvertInputStringToNumber = (str: string): number => {
  if (IsStringEmpty(str)) return 0;

  return Number(str);
};
