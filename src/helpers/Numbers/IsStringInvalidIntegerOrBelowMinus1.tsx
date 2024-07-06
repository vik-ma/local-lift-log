export const IsStringInvalidIntegerOrBelowMinus1 = (
  inputString: string
): boolean => {
  const inputNumber = Number(inputString);
  if (
    !Number.isInteger(inputNumber) ||
    !isFinite(inputNumber) ||
    inputNumber < -1
  )
    return true;
  return false;
};
