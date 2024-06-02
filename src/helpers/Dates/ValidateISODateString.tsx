import { parseAbsoluteToLocal } from "@internationalized/date";

export const ValidateISODateString = (dateISOString: string | null): boolean => {
  if (dateISOString === null) return false;

  try {
    parseAbsoluteToLocal(dateISOString);
    return true;
  } catch {
    return false;
  }
};
