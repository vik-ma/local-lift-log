export const GetValidatedStartDay = (startDay: number) => {
  if (startDay >= 0 && startDay <= 6) return startDay;

  return 0;
};
