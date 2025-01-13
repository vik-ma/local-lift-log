export const IsNumberWithinLimit = (
  value: number | null | undefined,
  numLimit: number | null,
  isMaxLimit: boolean,
  includeNullValues?: boolean
) => {
  if (numLimit === null) return true;

  if (value === null && includeNullValues) return true;

  if (value === null || value === undefined) return false;

  if (isMaxLimit) {
    return value <= numLimit;
  } else {
    return value >= numLimit;
  }
};
