export const GetCurrentYmdDateString = () => {
  const currentDate = new Date();
  const ymdDateString: string = currentDate.toISOString().substring(0, 10);
  return ymdDateString;
};
