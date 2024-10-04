import { useCallback, useEffect, useMemo, useState } from "react";
import { Measurement } from "../typings";
import Database from "tauri-plugin-sql-api";
import { UpdateIsFavorite, UpdateItemInList } from "../helpers";

export const useMeasurementList = () => {
  const [isMeasurementsLoading, setIsMeasurementsLoading] =
    useState<boolean>(true);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [favoritesCheckboxValue, setFavoritesCheckboxValue] =
    useState<boolean>(true);

  const filteredMeasurements = useMemo(() => {
    if (filterQuery !== "") {
      return measurements.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.measurement_type
            .toLocaleLowerCase()
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

      sortMeasurementsByName(result, true);

      setMeasurements(result);
      setIsMeasurementsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getMeasurements();
  }, [getMeasurements]);

  const toggleFavorite = async (measurement: Measurement) => {
    const newFavoriteValue = measurement.is_favorite === 1 ? 0 : 1;

    const success = await UpdateIsFavorite(
      measurement.id,
      "measurement",
      newFavoriteValue
    );

    if (!success) return;

    const updatedMeasurement: Measurement = {
      ...measurement,
      is_favorite: newFavoriteValue,
    };

    const updatedMeasurements = UpdateItemInList(
      measurements,
      updatedMeasurement
    );

    sortMeasurementsByName(updatedMeasurements, favoritesCheckboxValue)
  };

  const sortMeasurementsByName = (
    measurements: Measurement[],
    listFavoritesFirst: boolean
  ) => {
    measurements.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setMeasurements(measurements);
  };

  const handleListFavoritesFirstChange = (value: boolean) => {
    setFavoritesCheckboxValue(value);

    sortMeasurementsByName([...measurements], value);
  };

  return {
    measurements,
    setMeasurements,
    isMeasurementsLoading,
    filterQuery,
    setFilterQuery,
    filteredMeasurements,
    toggleFavorite,
    sortMeasurementsByName,
    favoritesCheckboxValue,
    handleListFavoritesFirstChange,
  };
};
