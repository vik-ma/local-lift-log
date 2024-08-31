import { useCallback, useEffect, useMemo, useState } from "react";
import { Measurement } from "../typings";
import Database from "tauri-plugin-sql-api";

export const useMeasurementList = () => {
  const [isMeasurementsLoading, setIsMeasurementsLoading] =
    useState<boolean>(true);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const filteredMeasurements = useMemo(() => {
    if (filterQuery !== "") {
      return measurements.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item
            .measurement_type!.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return measurements;
  }, [measurements, filterQuery]);

  const getMeasurements = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Measurement[]>(
        "SELECT * FROM measurements"
      );

      setMeasurements(result);
      setIsMeasurementsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getMeasurements();
  }, [getMeasurements]);

  return {
    measurements,
    setMeasurements,
    isMeasurementsLoading,
    filterQuery,
    setFilterQuery,
    filteredMeasurements,
  };
};
