import { useCallback, useState } from "react";
import { GetMeasurementsMap, GetUserMeasurements } from "../helpers";
import { MeasurementMap, UserMeasurement, Measurement } from "../typings";

export const useGetAllUserMeasurements = () => {
  const [measurementMap, setMeasurementMap] = useState<MeasurementMap>(
    new Map<string, Measurement>()
  );
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurement[]>(
    []
  );

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
    userMeasurements,
    getUserMeasurements,
    setUserMeasurements,
  };
};
