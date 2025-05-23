import { IsNumberValid } from "..";

export const ConvertMeasurementValue = (
  value: number,
  currentUnit: string,
  newUnit: string
) => {
  if (!IsNumberValid(value, 0, true)) return 0;

  if (currentUnit === newUnit) return value;

  const conversionToMillimeters: { [key: string]: number } = {
    cm: 10,
    mm: 1,
    in: 25.4,
  };

  const valueInMillimeters = value * conversionToMillimeters[currentUnit];

  const conversionFromMillimeters: { [key: string]: number } = {
    cm: 1 / 10,
    mm: 1,
    in: 1 / 25.4,
  };

  const convertedValue =
    valueInMillimeters * conversionFromMillimeters[newUnit];

  if (isNaN(convertedValue)) return value;

  return convertedValue;
};
