export const ValidateDateString = (dateString: string | null): boolean => {
  if (dateString === null) return false;

  return !Number.isNaN(new Date(dateString));
};
