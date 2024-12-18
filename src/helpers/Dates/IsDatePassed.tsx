export const IsDatePassed = (dateISOString: string) => {
  const currentDate = new Date();

  const date = new Date(dateISOString);

  return currentDate > date;
};
