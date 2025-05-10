import { ConvertNumberToTwoDecimals } from "..";

export const ConvertSecondsToMinutes = (seconds: number) => {
  if (seconds < 0) return 0;

  const minutes = seconds / 60;

  return ConvertNumberToTwoDecimals(minutes);
};
