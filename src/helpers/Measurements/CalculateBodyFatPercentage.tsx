import { log10 } from "mathjs";
import {
  GetBodyFatCalculationConstants,
  ConvertNumberToTwoDecimals,
  IsNumberValidAndAbove0,
} from "..";

export const CalculateBodyFatPercentage = (
  isMale: boolean,
  ageGroup: string,
  measurementInputs: string[]
) => {
  // Calculates Body Fat Percentage using the Durnin & Womersley method

  const { c, m } = GetBodyFatCalculationConstants(isMale, ageGroup);

  if (c === 0 || m === 0) return 0;

  if (measurementInputs.length !== 4) return 0;

  const sumOfMeasurements =
    measurementInputs
      .map((n) => Math.round(parseFloat(n) * 100))
      .reduce((a, b) => a + b, 0) / 100;

  if (!IsNumberValidAndAbove0(sumOfMeasurements)) return 0;

  const logSum = log10(sumOfMeasurements);

  const bodyDensity = c - m * logSum;

  const bodyFatPercentage = 495 / bodyDensity - 450;

  return ConvertNumberToTwoDecimals(bodyFatPercentage);
};
