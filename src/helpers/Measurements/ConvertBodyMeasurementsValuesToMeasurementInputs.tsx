import {
  Measurement,
  MeasurementMap,
  BodyMeasurementsValues,
} from "../../typings";

export const ConvertBodyMeasurementsValuesToMeasurementInputs = (
  bodyMeasurementsValues: BodyMeasurementsValues,
  measurementMap: MeasurementMap,
  bodyFatMeasurementsMap: Map<number, Measurement>
) => {
  const updatedActiveMeasurements: Measurement[] = [];
  const updatedValidBodyFatInputs = new Set<number>();

  for (const [id, values] of Object.entries(bodyMeasurementsValues)) {
    const measurement = measurementMap.get(id);

    const measurementId = Number(id);

    const measurementInput: Measurement = {
      id: measurementId,
      name: measurement ? measurement.name : "Unknown",
      default_unit: values.unit,
      measurement_type: values.measurement_type,
      is_favorite: measurement ? measurement.is_favorite : 0,
      input: values.value.toString(),
    };

    updatedActiveMeasurements.push(measurementInput);

    if (bodyFatMeasurementsMap.has(measurementId)) {
      updatedValidBodyFatInputs.add(measurementId);
    }
  }

  return { updatedActiveMeasurements, updatedValidBodyFatInputs };
};
