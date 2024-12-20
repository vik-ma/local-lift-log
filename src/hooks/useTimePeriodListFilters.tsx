import { useState } from "react";
import {
  NumberRange,
  TimePeriodListFilterMapKey,
  UseTimePeriodListFiltersReturnType,
} from "../typings";
import { CalendarDate, RangeValue } from "@nextui-org/react";
import { useCaloricIntakeTypes, useDefaultNumberRange } from ".";

export const useTimePeriodListFilters =
  (): UseTimePeriodListFiltersReturnType => {
    const [filterMap, setFilterMap] = useState<
      Map<TimePeriodListFilterMapKey, string>
    >(new Map());
    const [filterStartDateRange, setFilterStartDateRange] =
      useState<RangeValue<CalendarDate> | null>(null);
    const [filterEndDateRange, setFilterEndDateRange] =
      useState<RangeValue<CalendarDate> | null>(null);
    const [filterInjury, setFilterInjury] = useState<boolean>(false);

    const defaultNumberRange = useDefaultNumberRange();

    const [filterDurationRange, setFilterDurationRange] =
      useState<NumberRange>(defaultNumberRange);

    const caloricIntakeTypes = useCaloricIntakeTypes();

    const [filterCaloricIntakeTypes, setFilterCaloricIntakeTypes] = useState<
      Set<string>
    >(new Set(caloricIntakeTypes));

    return {
      filterMap,
      filterStartDateRange,
      setFilterStartDateRange,
      filterEndDateRange,
      setFilterEndDateRange,
      filterInjury,
      setFilterInjury,
      filterDurationRange,
      setFilterDurationRange,
      filterCaloricIntakeTypes,
      setFilterCaloricIntakeTypes,
      caloricIntakeTypes,
    };
  };
