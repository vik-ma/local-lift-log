export const ConvertDateToYearMonthString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const yearMonthString = `${year}-${month}`;
  return yearMonthString;
};
