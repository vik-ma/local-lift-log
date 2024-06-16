import {
  MeasurementMap,
  UserMeasurement,
  UserMeasurementValues,
} from "../../typings";
import { FormatDateTimeString } from "../Dates/FormatDateTimeString";
import { GenerateMeasurementListText } from "./GenerateMeasurementListText";

export const CreateDetailedUserMeasurementList = (
  userMeasurementList: UserMeasurement[],
  measurementMap: MeasurementMap,
  clockStyle: string
) => {
  const detailedUserMeasurementList: UserMeasurement[] = [];

  for (let i = 0; i < userMeasurementList.length; i++) {
    const userMeasurement = userMeasurementList[i];

    try {
      const userMeasurementValues: UserMeasurementValues = JSON.parse(
        userMeasurement.measurement_values
      );

      const { measurementListText, containsInvalidMeasurement } =
        GenerateMeasurementListText(userMeasurementValues, measurementMap);

      const formattedDate = FormatDateTimeString(
        userMeasurement.date,
        clockStyle === "24h"
      );

      const detailedUserMeasurement: UserMeasurement = {
        ...userMeasurement,
        measurementListText: measurementListText,
        formattedDate: formattedDate,
        isExpanded: false,
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
