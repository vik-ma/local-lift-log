export const FormatDateTimeString = (dateString: string): string => {
  const newDateString: string = new Date(dateString).toString();
  const formattedDate = `${newDateString.substring(0, 15)} - ${newDateString.substring(16, 24)}`;
  return formattedDate;
};
