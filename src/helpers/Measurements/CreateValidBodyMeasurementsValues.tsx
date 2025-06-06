import {
  GetValidatedMeasurementType,
  GetValidatedUnit,
  IsNumberValid,
  IsNumberValidInteger,
} from "..";
import { BodyMeasurementsValues, MeasurementMap } from "../../typings";

export const CreateValidBodyMeasurementsValues = (
  bodyMeasurementsValues: BodyMeasurementsValues,
  measurementMap: MeasurementMap
) => {
  const validBodyMeasurementsValues: BodyMeasurementsValues = {};

  let containsInvalidMeasurement = false;

  let numMeasurements = 0;

  for (const [id, values] of Object.entries(bodyMeasurementsValues)) {
    if (
      !IsNumberValidInteger(Number(id), 1) ||
      !IsNumberValid(values.value, 0, true)
    )
      continue;

    numMeasurements++;

    const measurementType = GetValidatedMeasurementType(
      values.measurement_type
    );

    const unit = GetValidatedUnit(
      values.unit,
      measurementType === "Caliper" ? "caliper" : "circumference"
    );

    validBodyMeasurementsValues[id] = {
      unit: unit,
      value: values.value,
      measurement_type: measurementType,
    };

    if (!measurementMap.has(id)) {
      containsInvalidMeasurement = true;
      validBodyMeasurementsValues[id].isInvalid = true;
    }
  }

  return {
    containsInvalidMeasurement,
    numMeasurements,
    validBodyMeasurementsValues,
  };
};
