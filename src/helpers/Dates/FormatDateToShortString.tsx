export const FormatDateToShortString = (date: Date, locale: string) => {
  const formattedDate = date.toLocaleDateString(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return formattedDate;
};
