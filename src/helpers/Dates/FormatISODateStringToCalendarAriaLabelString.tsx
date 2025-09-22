export const FormatISODateStringToCalendarAriaLabelString = (
  dateISOString: string,
  locale: string
) => {
  const date = new Date(dateISOString);

  const formattedDateString = date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formattedDateString;
};
