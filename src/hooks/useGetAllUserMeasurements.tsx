import { useCallback, useState } from "react";
import {
  GetMeasurementsMap,
  CreateDetailedUserMeasurementList,
} from "../helpers";
import Database from "tauri-plugin-sql-api";
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

      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserMeasurement[]>(
          "SELECT * FROM user_measurements ORDER BY id DESC"
        );

        const detailedUserMeasurements = CreateDetailedUserMeasurementList(
          result,
          measurementMap,
          clockStyle
        );

        setUserMeasurements(detailedUserMeasurements);
      } catch (error) {
        console.log(error);
      }
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
