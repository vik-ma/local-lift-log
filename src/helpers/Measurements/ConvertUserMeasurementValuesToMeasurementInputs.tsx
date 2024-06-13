import {
  Measurement,
  MeasurementMap,
  UserMeasurementValues,
} from "../../typings";

export const ConvertUserMeasurementValuesToMeasurementInputs = (
  userMeasurementValues: UserMeasurementValues,
  measurementMap: MeasurementMap
) => {
  const measurementInputs: Measurement[] = [];

  for (const [id, values] of Object.entries(userMeasurementValues)) {
    const measurement: Measurement = {
      id: Number(id),
      name: measurementMap[id] ? measurementMap[id].name : "Unknown",
      default_unit: values.unit,
      measurement_type: values.measurement_type,
      input: values.value.toString(),
    };

    measurementInputs.push(measurement);
  }

  return measurementInputs;
};
