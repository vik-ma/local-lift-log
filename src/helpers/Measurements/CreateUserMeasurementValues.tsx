import { Measurement, UserMeasurementValues } from "../../typings";
import { IsStringInvalidNumber } from "../Numbers/IsStringInvalidNumber";
import { IsStringEmpty } from "../Strings/IsStringEmpty";

export const CreateUserMeasurementValues = (
  measurements: Measurement[]
): string => {
  const userMeasurementValues: UserMeasurementValues = {};

  for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];

    if (
      measurement.input === undefined ||
      IsStringEmpty(measurement.input) ||
      IsStringInvalidNumber(measurement.input)
    ) {
      continue;
    }

    const inputNumber: number = Number(measurement.input);

    userMeasurementValues[measurement.id] = {
      value: inputNumber,
      unit: measurement.default_unit,
    };
  }

  return JSON.stringify(userMeasurementValues);
};
