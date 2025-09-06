import { Measurement, BodyMeasurementsValues } from "../../typings";
import {
  ConvertNumberToTwoDecimals,
  IsStringInvalidNumber,
  IsStringEmpty,
  GetValidatedMeasurementType,
  GetValidatedUnit,
} from "..";

export const CreateBodyMeasurementsValues = (measurements: Measurement[]) => {
  const bodyMeasurementValues: BodyMeasurementsValues = {};

  const minValue = 0;
  const doNotAllowMinValue = true;

  for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];

    if (
      measurement.input === undefined ||
      IsStringEmpty(measurement.input) ||
      IsStringInvalidNumber(measurement.input, minValue, doNotAllowMinValue)
    ) {
      continue;
    }

    const inputNumber: number = ConvertNumberToTwoDecimals(
      Number(measurement.input)
    );

    const measurementType = GetValidatedMeasurementType(
      measurement.measurement_type
    );

    const unit = GetValidatedUnit(
      measurement.default_unit,
      measurementType === "Caliper" ? "caliper" : "circumference"
    );

    bodyMeasurementValues[measurement.id] = {
      value: inputNumber,
      unit: unit,
      measurement_type: measurementType,
    };
  }

  return JSON.stringify(bodyMeasurementValues);
};
