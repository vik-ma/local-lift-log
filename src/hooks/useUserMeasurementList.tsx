import { useCallback, useMemo, useState } from "react";
import { GetMeasurementsMap, GetUserMeasurements } from "../helpers";
import { MeasurementMap, UserMeasurement, Measurement } from "../typings";

export const useUserMeasurementList = () => {
  const [measurementMap, setMeasurementMap] = useState<MeasurementMap>(
    new Map<string, Measurement>()
  );
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurement[]>(
    []
  );
  const [filterQuery, setFilterQuery] = useState<string>("");

  const filteredUserMeasurements = useMemo(() => {
    if (filterQuery !== "") {
      return userMeasurements.filter(
        (item) =>
          (item.userMeasurementValues !== undefined &&
            Object.keys(item.userMeasurementValues).some((key) =>
              measurementMap
                .get(key)
                ?.name.toLocaleLowerCase()
                .includes(filterQuery.toLocaleLowerCase())
            )) ||
          (item.comment !== null &&
            item.comment
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()))
      );
    }
    return userMeasurements;
  }, [userMeasurements, filterQuery, measurementMap]);

  const getUserMeasurements = useCallback(
    async (clockStyle: string) => {
      const measurementMap = await GetMeasurementsMap();
      setMeasurementMap(measurementMap);

      const detailedUserMeasurements = await GetUserMeasurements(
        clockStyle,
        measurementMap
      );
      setUserMeasurements(detailedUserMeasurements);
    },
    [setMeasurementMap, setUserMeasurements]
  );

  return {
    measurementMap,
    setMeasurementMap,
    userMeasurements,
    getUserMeasurements,
    setUserMeasurements,
    filterQuery,
    setFilterQuery,
    filteredUserMeasurements,
  };
};
