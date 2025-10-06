export const GetCalendarDateQuerySelectorString = (
  dateString: string,
  isDateToday: boolean
) => {
  if (isDateToday) return `[aria-label="Today, ${dateString}"]`;

  return `[aria-label="${dateString}"]`;
};
