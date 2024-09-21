export const CalculationStringsRegex = () => {
  const regexEquipment = /^e\[(.*)\]$/;
  const regexDistance = /^d\[(.*)\]$/;

  const CALCULATION_STRINGS_REGEX = { regexEquipment, regexDistance };

  Object.freeze(CALCULATION_STRINGS_REGEX);

  return CALCULATION_STRINGS_REGEX;
};
