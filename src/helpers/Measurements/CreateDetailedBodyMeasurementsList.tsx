import { FormatDateTimeString, GenerateMeasurementListText } from "..";
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
      const userMeasurementValues: BodyMeasurementsValues = JSON.parse(
        bodyMeasurements.measurement_values
      );

      const { measurementListText, containsInvalidMeasurement } =
        GenerateMeasurementListText(userMeasurementValues, measurementMap);

      const detailedUserMeasurement: BodyMeasurements = {
        ...bodyMeasurements,
        measurementListText: measurementListText,
        formattedDate: formattedDate,
        isExpanded: bodyMeasurements.id === idToExpand,
        bodyMeasurementsValues: userMeasurementValues,
        isInvalid: containsInvalidMeasurement,
      };

      detailedUserMeasurementList.push(detailedUserMeasurement);
    } catch {
      // Skip if bodyMeasurements.measurement_values contains invalid JSON string
      continue;
    }
  }

  return detailedUserMeasurementList;
};
