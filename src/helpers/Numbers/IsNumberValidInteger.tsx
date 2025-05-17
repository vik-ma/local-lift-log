export const IsNumberValidInteger = (
  number: number,
  minValue: number = 0,
  doNotAllowMinValue?: boolean,
  maxValue?: number
) => {
  if (isNaN(number)) return false;
  if (doNotAllowMinValue && number <= minValue) return false;
  if (number < minValue) return false;
  if (maxValue !== undefined && number > maxValue) return false;
  if (!Number.isInteger(number)) return false;
  return true;
};
