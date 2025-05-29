export const ConvertNullToEmptyInputString = (value: string | null) => {
  if (value === null) return "";
  return value;
};
