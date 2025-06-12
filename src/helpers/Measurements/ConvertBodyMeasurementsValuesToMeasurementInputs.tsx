import { GetValidatedMeasurementType, GetValidatedUnit } from "..";
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

    const measurementType = GetValidatedMeasurementType(
      values.measurement_type
    );

    const unit = GetValidatedUnit(
      values.unit,
      measurementType === "Caliper" ? "caliper" : "circumference"
    );

    const measurementInput: Measurement = {
      id: measurementId,
      name: measurement ? measurement.name : "Unknown",
      default_unit: unit,
      measurement_type: measurementType,
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
