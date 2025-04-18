export const ConvertISODateStringToYmdDateString = (dateString: string) => {
  const currentDate = new Date(dateString);
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  const ymdDateString = `${year}-${month}-${day}`;
  return ymdDateString;
};
