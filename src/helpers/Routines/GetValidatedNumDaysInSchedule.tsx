import { NUM_DAYS_IN_SCHEDULE_OPTIONS } from "../../constants";

export const GetValidatedNumDaysInSchedule = (numDaysInSchedule: number) => {
  const validNumDaysInSchedule = NUM_DAYS_IN_SCHEDULE_OPTIONS;

  if (validNumDaysInSchedule.includes(numDaysInSchedule))
    return numDaysInSchedule;

  return validNumDaysInSchedule[0];
};
