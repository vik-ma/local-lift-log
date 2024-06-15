import {
  MeasurementMap,
  UserMeasurement,
  UserMeasurementValues,
} from "../../typings";
import { FormatDateTimeString } from "../Dates/FormatDateTimeString";
import { Fragment, ReactNode } from "react";

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

      const measurementListText: ReactNode = measurementIds.map((id, index) => {
        const measurement = measurementMap.get(id);
        const isLastElement = index === measurementIds.length - 1;
        
        if (measurement) {
          return (
            <Fragment key={id}>
              {measurement.name}
              {!isLastElement && ", "}
            </Fragment>
          );
        } else {
          containsInvalidMeasurement = true;
          return (
            <Fragment key={id}>
              <span className="text-red-700">Unknown</span>
              {!isLastElement && ", "}
            </Fragment>
          );
        }
      });

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
