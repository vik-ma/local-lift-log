import { parseAbsoluteToLocal } from "@internationalized/date";

export const GetLatestTimeForDayISODateString = (dateString: string) => {
  try {
    const dateOfWorkout = parseAbsoluteToLocal(dateString).toDate();

    dateOfWorkout.setHours(23, 59, 59, 999);

    return dateOfWorkout.toISOString();
  } catch {
    return "Invalid Date";
  }
};
