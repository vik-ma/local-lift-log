import { Measurement, BodyMeasurementsValues } from "../../typings";
import {
  ConvertNumberToTwoDecimals,
  IsStringInvalidNumber,
  IsStringEmpty,
} from "..";

export const CreateBodyMeasurementsValues = (
  measurements: Measurement[]
): string => {
  const bodyMeasurementValues: BodyMeasurementsValues = {};

  for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];

    if (
      measurement.input === undefined ||
      IsStringEmpty(measurement.input) ||
      IsStringInvalidNumber(measurement.input, 0, true)
    ) {
      continue;
    }

    const inputNumber: number = ConvertNumberToTwoDecimals(
      Number(measurement.input)
    );

    bodyMeasurementValues[measurement.id] = {
      value: inputNumber,
      unit: measurement.default_unit,
      measurement_type: measurement.measurement_type,
    };
  }

  return JSON.stringify(bodyMeasurementValues);
};
