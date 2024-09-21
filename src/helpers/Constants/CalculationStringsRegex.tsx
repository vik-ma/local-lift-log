export const CalculationStringsRegex = () => {
  const regexEquipment = /^e\[(.*)\]x([1-9]\d*(?:\.\d{1,2})?|0\.\d{1,2})$/;
  const regexDistance = /^d\[(.*)\]x([1-9]\d*(?:\.\d{1,2})?|0\.\d{1,2})$/;

  const CALCULATION_STRINGS_REGEX = { regexEquipment, regexDistance };

  Object.freeze(CALCULATION_STRINGS_REGEX);

  return CALCULATION_STRINGS_REGEX;
};
