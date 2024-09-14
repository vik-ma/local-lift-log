import { evaluate } from "mathjs";

export const IsCalculationStringValid = (str: string): boolean => {
  // Test if string only contains:
  // numbers, operation symbols (+-*/), points, brackets and spaces
  const regex = /^[0-9+\-*/().\s]*$/;

  const containsValidCharacters = regex.test(str);

  if (!containsValidCharacters) return false;

  try {
    const calculation = evaluate(str);

    // Calculation needs to resolve a number above 0, not including Infinity
    if (
      calculation === undefined ||
      isNaN(calculation) ||
      calculation === Infinity ||
      calculation <= 0
    )
      return false;
  } catch {
    return false;
  }

  return true;
};
