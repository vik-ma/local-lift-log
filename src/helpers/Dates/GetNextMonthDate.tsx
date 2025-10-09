export const GetNextMonthDate = (date: Date) => {
  const nextMonthDate = new Date(date);

  const day = nextMonthDate.getDate();

  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

  if (nextMonthDate.getDate() < day) {
    nextMonthDate.setDate(0);
  }

  return nextMonthDate;
};
