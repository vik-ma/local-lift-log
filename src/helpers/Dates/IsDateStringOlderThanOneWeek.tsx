export const IsDateStringOlderThanOneWeek = (dateString: string) => {
  const dateStringDate = new Date(dateString);

  const currentDate = new Date();

  const oneWeekAgoDate = new Date();
  oneWeekAgoDate.setDate(currentDate.getDate() - 7);

  return dateStringDate < oneWeekAgoDate;
};
