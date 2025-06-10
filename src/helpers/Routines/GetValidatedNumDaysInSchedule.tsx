import { NumDaysInScheduleOptions } from "./NumDaysInScheduleOptions";

export const GetValidatedNumDaysInSchedule = (numDaysInSchedule: number) => {
  const validNumDaysInSchedule = NumDaysInScheduleOptions();

  if (validNumDaysInSchedule.includes(numDaysInSchedule))
    return numDaysInSchedule;

  return validNumDaysInSchedule[0];
};
