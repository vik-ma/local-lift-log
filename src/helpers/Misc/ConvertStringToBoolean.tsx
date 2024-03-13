export const ConvertStringToBoolean = (
  value: string | boolean
): boolean => {
  if (value === "true" || value === "True" || value === true)
    return true;
  return false;
};
