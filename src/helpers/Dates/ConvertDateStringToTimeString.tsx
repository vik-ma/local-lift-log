export const ConvertDateStringToTimeString = (
  dateString: string,
  is24hFormat: boolean
): string => {
  if (is24hFormat) {
    const timeString: string = dateString.substring(16, 24);
    return timeString;
  }

  const date = new Date(dateString);
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return timeString;
};
