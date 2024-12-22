export const GetNumberOfDaysBetweenDates = (
  startDateISOString: string | null,
  endDateISOString: string | null
) => {
  if (startDateISOString === null) return 0;

  try {
    const startDateTime = new Date(startDateISOString).getTime();
    let endDateTime =
      endDateISOString === null
        ? new Date().getTime()
        : new Date(endDateISOString).getTime();

    if (isNaN(startDateTime)) return 0;

    if (isNaN(endDateTime)) endDateTime = new Date().getTime();

    const deltaInMilliseconds = Math.abs(endDateTime - startDateTime);

    const deltaInDays = deltaInMilliseconds / (1000 * 60 * 60 * 24);

    return Math.ceil(deltaInDays);
  } catch {
    return 0;
  }
};
