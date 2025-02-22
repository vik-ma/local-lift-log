import { useEffect, useMemo, useRef, useState } from "react";
import {
  Measurement,
  MeasurementMap,
  MeasurementSortCategory,
  UseMeasurementListReturnType,
} from "../typings";
import {
  GetMeasurementList,
  GetMeasurementListWithNumberOfUserMeasurementEntries,
  InsertMeasurementIntoDatabase,
  UpdateIsFavorite,
  UpdateItemInList,
} from "../helpers";
import { useListFilters } from "./useListFilters";

export const useMeasurementList = (
  getMeasurementsOnLoad: boolean,
  showNumberOfUserMeasurementEntries?: boolean,
  ignoreMeasurementsWithNoEntries?: boolean
): UseMeasurementListReturnType => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<MeasurementSortCategory>("active");
  const [activeMeasurementSet, setActiveMeasurementSet] = useState<Set<number>>(
    new Set()
  );
  const measurementMap = useRef<MeasurementMap>(new Map());

  const isMeasurementListLoaded = useRef(false);

  const listFilters = useListFilters();

  const { filterMeasurementTypes, filterMap } = listFilters;

  const filteredMeasurements = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return measurements.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item.measurement_type
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("measurement-types") ||
            filterMeasurementTypes.has(item.measurement_type))
      );
    }
    return measurements;
  }, [measurements, filterQuery, filterMap, filterMeasurementTypes]);

  const sortMeasurementsByName = (measurements: Measurement[]) => {
    measurements.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setMeasurements(measurements);
  };

  const sortMeasurementsByFavoritesFirst = (measurements: Measurement[]) => {
    // Sort measurements by Favorite > Active > Name
    measurements.sort((a, b) => {
      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      }

      const aIsActive = +activeMeasurementSet.has(a.id);
      const bIsActive = +activeMeasurementSet.has(b.id);

      if (aIsActive !== bIsActive) {
        return bIsActive - aIsActive;
      }

      return a.name.localeCompare(b.name);
    });

    setMeasurements(measurements);
  };

  const sortMeasurementsByActiveFirst = (measurements: Measurement[]) => {
    // Sort measurements by Active > Favorite > Name
    measurements.sort((a, b) => {
      const aIsActive = +activeMeasurementSet.has(a.id);
      const bIsActive = +activeMeasurementSet.has(b.id);

      if (aIsActive !== bIsActive) {
        return bIsActive - aIsActive;
      }

      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      }

      return a.name.localeCompare(b.name);
    });

    setMeasurements(measurements);
  };

  const getMeasurements = async () => {
    if (isMeasurementListLoaded.current) return;

    const { measurements, newMeasurementMap } =
      showNumberOfUserMeasurementEntries
        ? await GetMeasurementListWithNumberOfUserMeasurementEntries(
            ignoreMeasurementsWithNoEntries
          )
        : await GetMeasurementList();

    measurementMap.current = newMeasurementMap;
    sortMeasurementsByActiveFirst(measurements);

    isMeasurementListLoaded.current = true;
  };

  useEffect(() => {
    if (getMeasurementsOnLoad) {
      getMeasurements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMeasurement = async (
    newMeasurement: Measurement
  ): Promise<number> => {
    const newMeasurementId = await InsertMeasurementIntoDatabase(
      newMeasurement
    );

    if (newMeasurementId === 0) return 0;

    newMeasurement.id = newMeasurementId;

    const updatedMeasurementMap = new Map(measurementMap.current);

    updatedMeasurementMap.set(newMeasurementId.toString(), newMeasurement);

    sortMeasurementsByActiveCategory([...measurements, newMeasurement]);
    measurementMap.current = updatedMeasurementMap;

    return newMeasurementId;
  };

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

    const updatedMeasurementMap = new Map<string, Measurement>(
      measurementMap.current
    );

    updatedMeasurementMap.set(measurement.id.toString(), updatedMeasurement);

    measurementMap.current = updatedMeasurementMap;
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
    isMeasurementListLoaded,
    filterQuery,
    setFilterQuery,
    filteredMeasurements,
    toggleFavorite,
    sortCategory,
    handleSortOptionSelection,
    sortMeasurementsByActiveCategory,
    activeMeasurementSet,
    setActiveMeasurementSet,
    measurementMap,
    createMeasurement,
    listFilters,
    getMeasurements,
  };
};
