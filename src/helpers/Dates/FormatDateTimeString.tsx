export const FormatDateTimeString = (dateString: string): string => {
  const formattedDate: string = new Date(dateString)
    .toString()
    .substring(0, 24);
  return formattedDate;
};
