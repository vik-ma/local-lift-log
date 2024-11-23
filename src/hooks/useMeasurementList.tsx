import { useCallback, useEffect, useMemo, useState } from "react";
import { Measurement } from "../typings";
import Database from "tauri-plugin-sql-api";
import { UpdateIsFavorite, UpdateItemInList } from "../helpers";

type MeasurementSortCategory = "favorite" | "active" | "name";

export const useMeasurementList = () => {
  const [isMeasurementsLoading, setIsMeasurementsLoading] =
    useState<boolean>(true);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<MeasurementSortCategory>("favorite");
  const [activeMeasurementSet, setActiveMeasurementSet] = useState<Set<number>>(
    new Set()
  );

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

      sortMeasurementsByFavoritesFirst(result);

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

    sortMeasurementsByActiveCategory(updatedMeasurements);
  };

  const sortMeasurementsByName = (measurements: Measurement[]) => {
    measurements.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setMeasurements(measurements);
  };

  const sortMeasurementsByFavoritesFirst = (measurements: Measurement[]) => {
    measurements.sort((a, b) => {
      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setMeasurements(measurements);
  };

  const sortMeasurementsByActiveFirst = (measurements: Measurement[]) => {
    measurements.sort((a, b) => {
      const aIsActive = activeMeasurementSet.has(a.id);
      const bIsActive = activeMeasurementSet.has(b.id);

      if (aIsActive && !bIsActive) return -1;

      if (!aIsActive && bIsActive) return 1;

      return a.name.localeCompare(b.name);
    });

    setMeasurements(measurements);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortMeasurementsByName([...measurements]);
    } else if (key === "favorite") {
      setSortCategory(key);
      sortMeasurementsByFavoritesFirst([...measurements]);
    } else if (key === "active") {
      setSortCategory(key);
      sortMeasurementsByActiveFirst([...measurements]);
    }
  };

  const sortMeasurementsByActiveCategory = (measurements: Measurement[]) => {
    switch (sortCategory) {
      case "favorite":
        sortMeasurementsByFavoritesFirst(measurements);
        break;
      case "name":
        sortMeasurementsByName(measurements);
        break;
      case "active":
        sortMeasurementsByActiveFirst(measurements);
        break;
      default:
        break;
    }
  };

  return {
    measurements,
    setMeasurements,
    isMeasurementsLoading,
    filterQuery,
    setFilterQuery,
    filteredMeasurements,
    toggleFavorite,
    sortCategory,
    handleSortOptionSelection,
    sortMeasurementsByActiveCategory,
    activeMeasurementSet,
    setActiveMeasurementSet,
  };
};
