import { IsNumberValid } from "..";

export const GetValidatedSetValue = (
  value: number,
  isRir?: boolean,
  isRpe?: boolean
) => {
  if (isRir) {
    if (isNaN(value)) return -1;
    if (value < -1) return -1;
    if (!isFinite(value)) return -1;
    return value;
  }

  if (isRpe) {
    if (isNaN(value)) return -1;
    if (value < 1 || value > 10) return -1;
    return value;
  }

  if (IsNumberValid(value)) return value;

  return 0;
};
