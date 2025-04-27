import {
  Measurement,
  MeasurementMap,
  BodyMeasurementsValues,
} from "../../typings";

export const ConvertBodyMeasurementsValuesToMeasurementInputs = (
  userMeasurementValues: BodyMeasurementsValues,
  measurementMap: MeasurementMap
): Measurement[] => {
  const measurementInputs: Measurement[] = [];

  for (const [id, values] of Object.entries(userMeasurementValues)) {
    const measurement = measurementMap.get(id);

    const measurementInput: Measurement = {
      id: Number(id),
      name: measurement ? measurement.name : "Unknown",
      default_unit: values.unit,
      measurement_type: values.measurement_type,
      is_favorite: measurement ? measurement.is_favorite : 0,
      input: values.value.toString(),
    };

    measurementInputs.push(measurementInput);
  }

  return measurementInputs;
};
