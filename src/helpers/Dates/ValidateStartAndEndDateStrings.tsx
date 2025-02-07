import { ValidateISODateString } from "..";

export const ValidateStartAndEndDateStrings = (
  startDateString: string | null,
  endDateString: string | null,
  mustBeISOStrings?: boolean,
  endDateCanNotBeNull?: boolean
): boolean => {
  if (startDateString === null) return false;

  if (endDateCanNotBeNull && endDateString === null) return false;

  if (mustBeISOStrings && !ValidateISODateString(startDateString)) return false;

  const startDate = Date.parse(startDateString);

  if (isNaN(startDate)) return false;

  if (endDateString !== null) {
    if (mustBeISOStrings && !ValidateISODateString(endDateString))
      return false;

    const endDate = Date.parse(endDateString);

    if (isNaN(endDate)) return false;

    if (startDate > endDate) return false;
  }

  return true;
};
