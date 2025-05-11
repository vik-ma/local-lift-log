import {
  CreateValidBodyMeasurementsValues,
  FormatDateTimeString,
  FormatNumItemsString,
} from "..";
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
  const detailedBodyMeasurementsList: BodyMeasurements[] = [];

  for (let i = 0; i < bodyMeasurementsList.length; i++) {
    const bodyMeasurements = bodyMeasurementsList[i];

    if (bodyMeasurements.weight < 0) continue;

    const formattedDate = FormatDateTimeString(
      bodyMeasurements.date,
      clockStyle === "24h"
    );

    if (formattedDate === "Invalid Date") continue;

    try {
      const bodyMeasurementsValues: BodyMeasurementsValues = JSON.parse(
        bodyMeasurements.measurement_values
      );

      const {
        containsInvalidMeasurement,
        numMeasurements,
        validBodyMeasurementsValues,
      } = CreateValidBodyMeasurementsValues(
        bodyMeasurementsValues,
        measurementMap
      );

      if (
        bodyMeasurements.weight === 0 &&
        bodyMeasurements.body_fat_percentage === null &&
        numMeasurements === 0
      )
        continue;

      const detailedBodyMeasurements: BodyMeasurements = {
        ...bodyMeasurements,
        measurementsText:
          numMeasurements > 0
            ? FormatNumItemsString(numMeasurements, "Measurement")
            : undefined,
        formattedDate: formattedDate,
        isExpanded:
          numMeasurements === 0 ? false : bodyMeasurements.id === idToExpand,
        bodyMeasurementsValues: validBodyMeasurementsValues,
        isInvalid: containsInvalidMeasurement,
        disableExpansion: numMeasurements === 0,
      };

      detailedBodyMeasurementsList.push(detailedBodyMeasurements);
    } catch {
      // Skip if bodyMeasurements.measurement_values contains invalid JSON string
      continue;
    }
  }

  return detailedBodyMeasurementsList;
};
