export const FormatDateTimeString = (
  dateString: string,
  is24hFormat: boolean
): string => {
  if (is24hFormat) {
    const formattedDate: string = new Date(dateString)
      .toString()
      .substring(0, 24);
    return formattedDate;
  }

  const formattedDate = new Date(dateString)
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })
    .replace(/,/g, "");
  return formattedDate;
};
