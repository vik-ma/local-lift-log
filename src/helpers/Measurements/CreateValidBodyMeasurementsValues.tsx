import {
  IsNumberValidAndAbove0,
  IsNumberValidId,
  ValidMeasurementUnits,
} from "..";
import { BodyMeasurementsValues, MeasurementMap } from "../../typings";

export const CreateValidBodyMeasurementsValues = (
  bodyMeasurementsValues: BodyMeasurementsValues,
  measurementMap: MeasurementMap
) => {
  const validMeasurementUnits = ValidMeasurementUnits();

  const validBodyMeasurementsValues: BodyMeasurementsValues = {};

  let containsInvalidMeasurement = false;

  let numMeasurements = 0;

  for (const [id, values] of Object.entries(bodyMeasurementsValues)) {
    if (!IsNumberValidId(Number(id)) || !IsNumberValidAndAbove0(values.value))
      continue;

    numMeasurements++;

    const measurementUnit = validMeasurementUnits.includes(values.unit)
      ? values.unit
      : "mm";

    const measurementType =
      values.measurement_type === "Caliper" ? "Caliper" : "Circumference";

    validBodyMeasurementsValues[id] = {
      unit: measurementUnit,
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
