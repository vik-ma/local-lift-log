export const IsYmdDateStringValid = (dateString: string) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the string matches the format YYYY-MM-DD
  if (!regex.test(dateString)) {
    return false;
  }

  // Parse the string into a Date object
  const dateParts = dateString.split("-");
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  const date = new Date(year, month, day);

  // Check if the Date object represents a valid date
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};
