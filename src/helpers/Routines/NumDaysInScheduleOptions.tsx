export const NumDaysInScheduleOptions = (): number[] => {
  return Array.from({ length: 13 }, (_, index) => index + 2);
};
