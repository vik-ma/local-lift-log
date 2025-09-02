const regexEquipment = /^e\[(.*)\]x([1-9]\d*(?:\.\d{1,2})?|0\.\d{1,2})$/;
const regexDistance  = /^d\[(.*)\]x([1-9]\d*(?:\.\d{1,2})?|0\.\d{1,2})$/;

export const CALCULATION_STRINGS_REGEX = Object.freeze({
  regexEquipment,
  regexDistance,
});
