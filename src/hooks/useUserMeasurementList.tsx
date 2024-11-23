import { useCallback, useState } from "react";
import { GetMeasurementsMap, GetUserMeasurements } from "../helpers";
import { MeasurementMap, UserMeasurement, Measurement } from "../typings";

type UserMeasurementSortCategory = "date-asc" | "date-desc";

export const useUserMeasurementList = () => {
  const [measurementMap, setMeasurementMap] = useState<MeasurementMap>(
    new Map<string, Measurement>()
  );
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurement[]>(
    []
  );
  const [sortCategory, setSortCategory] =
    useState<UserMeasurementSortCategory>("date-desc");

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

  const sortUserMeasurementsByDate = (
    userMeasurementList: UserMeasurement[],
    isAscending: boolean
  ) => {
    if (isAscending) {
      userMeasurementList.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      userMeasurementList.sort((a, b) => b.date.localeCompare(a.date));
    }

    setUserMeasurements(userMeasurementList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "date-desc") {
      setSortCategory(key);
      sortUserMeasurementsByDate([...userMeasurements], false);
    } else if (key === "date-asc") {
      setSortCategory(key);
      sortUserMeasurementsByDate([...userMeasurements], true);
    }
  };

  const sortUserMeasurementsByActiveCategory = (
    userMeasurementList: UserMeasurement[]
  ) => {
    switch (sortCategory) {
      case "date-desc":
        sortUserMeasurementsByDate([...userMeasurementList], false);
        break;
      case "date-asc":
        sortUserMeasurementsByDate([...userMeasurementList], true);
        break;
      default:
        break;
    }
  };

  return {
    measurementMap,
    setMeasurementMap,
    userMeasurements,
    getUserMeasurements,
    setUserMeasurements,
    sortCategory,
    handleSortOptionSelection,
    sortUserMeasurementsByActiveCategory,
  };
};
