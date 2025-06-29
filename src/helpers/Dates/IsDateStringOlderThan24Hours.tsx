export const IsDateStringOlderThan24Hours = (dateString: string) => {
  const dateStringDate = new Date(dateString);

  const currentDate = new Date();

  const oneDayAgoDate = new Date();
  oneDayAgoDate.setDate(currentDate.getDate() - 1);

  return dateStringDate < oneDayAgoDate;
};
