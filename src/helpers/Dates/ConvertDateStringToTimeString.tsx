export const ConvertDateStringToTimeString = (dateString: string): string => {
  const date = new Date(dateString);
  const timeString: string = date.toString().substring(16, 24);
  return timeString;
};
