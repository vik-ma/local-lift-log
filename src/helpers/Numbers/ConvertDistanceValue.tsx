import { IsNumberValid } from "..";

export const ConvertDistanceValue = (
  value: number,
  currentUnit: string,
  newUnit: string
) => {
  const minValue = 0;
  const doNotAllowMinValue = true;

  if (!IsNumberValid(value, minValue, doNotAllowMinValue)) return 0;

  if (currentUnit === newUnit) return value;

  const conversionToMeters: { [key: string]: number } = {
    km: 1000,
    m: 1,
    mi: 1609.34,
    ft: 0.3048,
    yd: 0.9144,
  };

  const valueInMeters = value * conversionToMeters[currentUnit];

  const conversionFromMeters: { [key: string]: number } = {
    km: 1 / 1000,
    m: 1,
    mi: 1 / 1609.34,
    ft: 1 / 0.3048,
    yd: 1 / 0.9144,
  };

  const convertedValue = valueInMeters * conversionFromMeters[newUnit];

  if (isNaN(convertedValue)) return value;

  return convertedValue;
};
