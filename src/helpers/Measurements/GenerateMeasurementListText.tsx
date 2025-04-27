import { ReactNode, Fragment } from "react";
import { MeasurementMap, BodyMeasurementsValues } from "../../typings";

type GenerateMeasurementListTextReturnType = {
  measurementListText: ReactNode;
  containsInvalidMeasurement: boolean;
};

export const GenerateMeasurementListText = (
  userMeasurementValues: BodyMeasurementsValues,
  measurementMap: MeasurementMap
): GenerateMeasurementListTextReturnType => {
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

  return {
    measurementListText: measurementListText,
    containsInvalidMeasurement: containsInvalidMeasurement,
  };
};
