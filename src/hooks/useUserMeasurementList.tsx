import { useCallback, useState } from "react";
import { GetUserMeasurements } from "../helpers";
import { UseMeasurementListReturnType, UserMeasurement } from "../typings";

type UserMeasurementSortCategory = "date-asc" | "date-desc";

export const useUserMeasurementList = (
  useMeasurementList: UseMeasurementListReturnType
) => {
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurement[]>(
    []
  );
  const [sortCategory, setSortCategory] =
    useState<UserMeasurementSortCategory>("date-desc");

  const { measurementMap, isMeasurementListLoaded } = useMeasurementList;

  const getUserMeasurements = useCallback(
    async (clockStyle: string) => {
      if (!isMeasurementListLoaded) return;

      const detailedUserMeasurements = await GetUserMeasurements(
        clockStyle,
        measurementMap
      );
      setUserMeasurements(detailedUserMeasurements);
    },
    [measurementMap, isMeasurementListLoaded]
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
    userMeasurements,
    getUserMeasurements,
    setUserMeasurements,
    sortCategory,
    handleSortOptionSelection,
    sortUserMeasurementsByActiveCategory,
  };
};
