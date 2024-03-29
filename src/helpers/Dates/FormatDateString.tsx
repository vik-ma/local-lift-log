export const FormatDateString = (dateString: string): string => {
  const formattedDate: string = new Date(dateString).toDateString();
  return formattedDate;
};
