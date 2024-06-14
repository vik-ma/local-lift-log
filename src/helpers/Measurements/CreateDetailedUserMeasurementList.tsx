import {
  MeasurementMap,
  UserMeasurement,
  UserMeasurementValues,
} from "../../typings";
import { FormatDateTimeString } from "../Dates/FormatDateTimeString";

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

      const measurementIds: string[] = Object.keys(userMeasurementValues);

      let containsInvalidMeasurement = false;

      const measurementListString = measurementIds
        .map((id) => {
          const measurement = measurementMap.get(id);
          if (measurement) {
            return measurement.name;
          } else {
            containsInvalidMeasurement = true;
            return "Unknown";
          }
        })
        .join(", ");

      const formattedDate = FormatDateTimeString(
        userMeasurement.date,
        clockStyle === "24h"
      );

      const detailedUserMeasurement: UserMeasurement = {
        ...userMeasurement,
        measurementListString: measurementListString,
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
