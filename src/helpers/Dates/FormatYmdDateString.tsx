export const FormatYmdDateString = (ymdDateString: string) => {
  const formattedDate: string = new Date(ymdDateString).toDateString();
  return formattedDate;
};
