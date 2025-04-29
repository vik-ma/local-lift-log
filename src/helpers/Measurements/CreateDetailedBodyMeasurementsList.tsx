import { FormatDateTimeString, FormatNumItemsString } from "..";
import {
  BodyMeasurements,
  BodyMeasurementsValues,
  MeasurementMap,
} from "../../typings";

export const CreateDetailedBodyMeasurementsList = (
  bodyMeasurementsList: BodyMeasurements[],
  measurementMap: MeasurementMap,
  clockStyle: string,
  idToExpand: number
) => {
  const detailedUserMeasurementList: BodyMeasurements[] = [];

  for (let i = 0; i < bodyMeasurementsList.length; i++) {
    const bodyMeasurements = bodyMeasurementsList[i];

    const formattedDate = FormatDateTimeString(
      bodyMeasurements.date,
      clockStyle === "24h"
    );

    if (formattedDate === "Invalid Date") continue;

    try {
      const bodyMeasurementsValues: BodyMeasurementsValues = JSON.parse(
        bodyMeasurements.measurement_values
      );

      let containsInvalidMeasurement = false;

      let numMeasurements = 0;

      for (const measurementId of Object.keys(bodyMeasurementsValues)) {
        numMeasurements++;

        if (!measurementMap.has(measurementId))
          containsInvalidMeasurement = true;
      }

      const detailedUserMeasurement: BodyMeasurements = {
        ...bodyMeasurements,
        measurementsText:
          numMeasurements > 0
            ? FormatNumItemsString(numMeasurements, "Measurement")
            : undefined,
        formattedDate: formattedDate,
        isExpanded: bodyMeasurements.id === idToExpand,
        bodyMeasurementsValues: bodyMeasurementsValues,
        isInvalid: containsInvalidMeasurement,
        disableExpansion: Object.keys(bodyMeasurementsValues).length === 0,
      };

      detailedUserMeasurementList.push(detailedUserMeasurement);
    } catch {
      // Skip if bodyMeasurements.measurement_values contains invalid JSON string
      continue;
    }
  }

  return detailedUserMeasurementList;
};
