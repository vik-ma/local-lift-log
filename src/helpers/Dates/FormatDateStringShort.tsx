export const FormatDateStringShort = (dateString: string, locale: string) => {
  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return formattedDate;
};
