export const ConvertEmptyStringToNull = (
  value: string | null
): string | null => {
  if (value === null) return null;
  if (value.trim().length === 0) return null;
  return value;
};
