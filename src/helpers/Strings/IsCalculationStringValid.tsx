import { evaluate } from "mathjs";

type IsCalculationStringValidReturnType = {
  isCalculationValid: boolean;
  result: number;
};

export const IsCalculationStringValid = (
  str: string
): IsCalculationStringValidReturnType => {
  // Test if string only contains:
  // numbers, operation symbols (+-*/), points, brackets and spaces
  const regex = /^[0-9+\-*/().\s]*$/;

  const containsValidCharacters = regex.test(str);

  if (!containsValidCharacters) return { isCalculationValid: false, result: 0 };

  try {
    const calculation = evaluate(str);

    // Calculation needs to resolve a number above 0, not including Infinity
    if (
      calculation === undefined ||
      isNaN(calculation) ||
      calculation === Infinity ||
      calculation <= 0
    )
      return { isCalculationValid: false, result: 0 };

    return { isCalculationValid: true, result: calculation };
  } catch {
    return { isCalculationValid: false, result: 0 };
  }
};
