import {
  MeasurementMap,
  UserMeasurement,
  UserMeasurementValues,
} from "../../typings";
import { FormatDateTimeString, GenerateMeasurementListText } from "..";

export const CreateDetailedUserMeasurementList = (
  userMeasurementList: UserMeasurement[],
  measurementMap: MeasurementMap,
  clockStyle: string,
  idToExpand: number
) => {
  const detailedUserMeasurementList: UserMeasurement[] = [];

  for (let i = 0; i < userMeasurementList.length; i++) {
    const userMeasurement = userMeasurementList[i];

    const formattedDate = FormatDateTimeString(
      userMeasurement.date,
      clockStyle === "24h"
    );

    if (formattedDate === "Invalid Date") continue;

    try {
      const userMeasurementValues: UserMeasurementValues = JSON.parse(
        userMeasurement.measurement_values
      );

      const { measurementListText, containsInvalidMeasurement } =
        GenerateMeasurementListText(userMeasurementValues, measurementMap);

      const detailedUserMeasurement: UserMeasurement = {
        ...userMeasurement,
        measurementListText: measurementListText,
        formattedDate: formattedDate,
        isExpanded: userMeasurement.id === idToExpand,
        userMeasurementValues: userMeasurementValues,
        isInvalid: containsInvalidMeasurement,
      };

      detailedUserMeasurementList.push(detailedUserMeasurement);
    } catch {
      // Skip if userMeasurement.measurement_values contains invalid JSON string
      continue;
    }
  }

  return detailedUserMeasurementList;
};
