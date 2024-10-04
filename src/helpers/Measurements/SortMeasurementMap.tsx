import { MeasurementMap } from "../../typings";

export const SortMeasurementMap = (measurementMap: MeasurementMap) => {
  const sortedEntries = Array.from(measurementMap.entries()).sort(
    ([, measurementA], [, measurementB]) => {
      if (measurementA.is_favorite !== measurementB.is_favorite) {
        return measurementB.is_favorite - measurementA.is_favorite;
      }
      return measurementA.name.localeCompare(measurementB.name);
    }
  );

  const sortedMeasurementMap = new Map(sortedEntries);

  return sortedMeasurementMap;
};
