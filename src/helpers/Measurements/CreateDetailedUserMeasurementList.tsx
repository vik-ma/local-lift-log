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

      const measurementListString = measurementIds
        .map((id) => {
          if (measurementMap[id]) {
            return measurementMap[id].name;
          } else {
            return "Unknown Measurement";
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
      };

      detailedUserMeasurementList.push(detailedUserMeasurement);
    } catch {
      // Skip if userMeasurement.measurement_values contains invalid JSON string
      continue;
    }
  }

  return detailedUserMeasurementList;
};
