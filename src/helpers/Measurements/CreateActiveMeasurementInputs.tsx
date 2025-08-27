import { Measurement, MeasurementMap } from "../../typings";
import { GenerateActiveMeasurementList } from "..";

export const CreateActiveMeasurementInputs = (
  activeMeasurementsString: string,
  measurementMap: MeasurementMap
) => {
  const activeMeasurements: Measurement[] = [];

  const activeMeasurementList = GenerateActiveMeasurementList(
    activeMeasurementsString
  );

  for (const measurementId of activeMeasurementList) {
    const id = measurementId.toString();

    if (measurementMap.has(id)) {
      const measurement: Measurement = {
        ...measurementMap.get(id)!,
        input: "",
      };

      activeMeasurements.push(measurement);
    }
  }

  return activeMeasurements;
};
