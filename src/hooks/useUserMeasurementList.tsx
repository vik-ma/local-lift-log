import { useCallback, useMemo, useState } from "react";
import {
  GetUserMeasurements,
  IsDateInWeekdaySet,
  IsDateWithinRange,
  IsMeasurementInUserMeasurementValues,
} from "../helpers";
import { UseMeasurementListReturnType, UserMeasurement } from "../typings";
import { useListFilters } from "./useListFilters";

type UserMeasurementSortCategory = "date-asc" | "date-desc";

export const useUserMeasurementList = (
  useMeasurementList: UseMeasurementListReturnType
) => {
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurement[]>(
    []
  );
  const [sortCategory, setSortCategory] =
    useState<UserMeasurementSortCategory>("date-desc");
  const [filterQuery, setFilterQuery] = useState<string>("");

  const { measurementMap, isMeasurementListLoaded } = useMeasurementList;

  const listFilters = useListFilters(undefined, undefined, measurementMap);

  const { filterMap, filterDateRange, filterWeekdays, filterMeasurements } =
    listFilters;

  const filteredUserMeasurements = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return userMeasurements.filter(
        (item) =>
          ((item.userMeasurementValues !== undefined &&
            Object.keys(item.userMeasurementValues).some((key) =>
              measurementMap
                .get(key)
                ?.name.toLocaleLowerCase()
                .includes(filterQuery.toLocaleLowerCase())
            )) ||
            item.comment
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("dates") ||
            IsDateWithinRange(item.date, filterDateRange)) &&
          (!filterMap.has("weekdays") ||
            IsDateInWeekdaySet(item.date, filterWeekdays)) &&
          (!filterMap.has("measurements") ||
            IsMeasurementInUserMeasurementValues(
              item.userMeasurementValues,
              filterMeasurements
            ))
      );
    }
    return userMeasurements;
  }, [
    userMeasurements,
    filterQuery,
    measurementMap,
    filterMap,
    filterDateRange,
    filterWeekdays,
    filterMeasurements,
  ]);

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
    filteredUserMeasurements,
    filterQuery,
    setFilterQuery,
    listFilters,
  };
};
