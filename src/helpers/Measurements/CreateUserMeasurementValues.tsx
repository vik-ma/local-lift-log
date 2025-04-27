import { Measurement, BodyMeasurementsValues } from "../../typings";
import {
  ConvertNumberToTwoDecimals,
  IsStringInvalidNumber,
  IsStringEmpty,
} from "..";

export const CreateUserMeasurementValues = (
  measurements: Measurement[]
): string => {
  const userMeasurementValues: BodyMeasurementsValues = {};

  for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];

    if (
      measurement.input === undefined ||
      IsStringEmpty(measurement.input) ||
      IsStringInvalidNumber(measurement.input)
    ) {
      continue;
    }

    const inputNumber: number = ConvertNumberToTwoDecimals(
      Number(measurement.input)
    );

    userMeasurementValues[measurement.id] = {
      value: inputNumber,
      unit: measurement.default_unit,
      measurement_type: measurement.measurement_type,
    };
  }

  return JSON.stringify(userMeasurementValues);
};
