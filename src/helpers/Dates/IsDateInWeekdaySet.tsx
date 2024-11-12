export const IsDateInWeekdaySet = (
  dateISOString: string,
  filterWeekdays: Set<string>
) => {
  try {
    const date = new Date(dateISOString);

    const weekdayString = date.getDay().toString();

    return filterWeekdays.has(weekdayString);
  } catch {
    return false;
  }
};
