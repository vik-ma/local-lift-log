import { useMemo } from "react";
import { FilterMinAndMaxValuesSetStateMap } from "../typings";

type UseFilterMinAndMaxValuesSetStateMapProps = {
  setFilterMinWeight?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxWeight?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMinDistance?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxDistance?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMinNumScheduleDays?: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  setFilterMaxNumScheduleDays?: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  setFilterMinDuration?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxDuration?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMinCalories?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxCalories?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMinFat?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxFat?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMinCarbs?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxCarbs?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMinProtein?: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxProtein?: React.Dispatch<React.SetStateAction<number | null>>;
};

export const useFilterMinAndMaxValuesSetStateMap = ({
  setFilterMinWeight,
  setFilterMaxWeight,
  setFilterMinDistance,
  setFilterMaxDistance,
  setFilterMinNumScheduleDays,
  setFilterMaxNumScheduleDays,
  setFilterMinDuration,
  setFilterMaxDuration,
  setFilterMinCalories,
  setFilterMaxCalories,
  setFilterMinFat,
  setFilterMaxFat,
  setFilterMinCarbs,
  setFilterMaxCarbs,
  setFilterMinProtein,
  setFilterMaxProtein,
}: UseFilterMinAndMaxValuesSetStateMapProps) => {
  const filterMinAndMaxValuesSetStateMap = useMemo(() => {
    const filterSetStateMap: FilterMinAndMaxValuesSetStateMap = new Map();

    if (setFilterMinWeight !== undefined) {
      filterSetStateMap.set("min-weight", setFilterMinWeight);
    }

    if (setFilterMaxWeight !== undefined) {
      filterSetStateMap.set("max-weight", setFilterMaxWeight);
    }

    if (setFilterMinDistance !== undefined) {
      filterSetStateMap.set("min-distance", setFilterMinDistance);
    }

    if (setFilterMaxDistance !== undefined) {
      filterSetStateMap.set("max-distance", setFilterMaxDistance);
    }

    if (setFilterMinNumScheduleDays !== undefined) {
      filterSetStateMap.set(
        "min-num-schedule-days",
        setFilterMinNumScheduleDays
      );
    }

    if (setFilterMaxNumScheduleDays !== undefined) {
      filterSetStateMap.set(
        "max-num-schedule-days",
        setFilterMaxNumScheduleDays
      );
    }

    if (setFilterMinDuration !== undefined) {
      filterSetStateMap.set("min-duration", setFilterMinDuration);
    }

    if (setFilterMaxDuration !== undefined) {
      filterSetStateMap.set("max-duration", setFilterMaxDuration);
    }

    if (setFilterMinCalories !== undefined) {
      filterSetStateMap.set("min-calories", setFilterMinCalories);
    }

    if (setFilterMaxCalories !== undefined) {
      filterSetStateMap.set("max-calories", setFilterMaxCalories);
    }

    if (setFilterMinFat !== undefined) {
      filterSetStateMap.set("min-fat", setFilterMinFat);
    }

    if (setFilterMaxFat !== undefined) {
      filterSetStateMap.set("max-fat", setFilterMaxFat);
    }

    if (setFilterMinCarbs !== undefined) {
      filterSetStateMap.set("min-carbs", setFilterMinCarbs);
    }

    if (setFilterMaxCarbs !== undefined) {
      filterSetStateMap.set("max-carbs", setFilterMaxCarbs);
    }

    if (setFilterMinProtein !== undefined) {
      filterSetStateMap.set("min-protein", setFilterMinProtein);
    }

    if (setFilterMaxProtein !== undefined) {
      filterSetStateMap.set("max-protein", setFilterMaxProtein);
    }

    return filterSetStateMap;
  }, [
    setFilterMinWeight,
    setFilterMaxWeight,
    setFilterMinDistance,
    setFilterMaxDistance,
    setFilterMinNumScheduleDays,
    setFilterMaxNumScheduleDays,
    setFilterMinDuration,
    setFilterMaxDuration,
    setFilterMinCalories,
    setFilterMaxCalories,
    setFilterMinFat,
    setFilterMaxFat,
    setFilterMinCarbs,
    setFilterMaxCarbs,
    setFilterMinProtein,
    setFilterMaxProtein,
  ]);

  return filterMinAndMaxValuesSetStateMap;
};
