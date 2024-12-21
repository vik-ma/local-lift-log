import { useState } from "react";
import {
  NumberRange,
  TimePeriodListFilterMapKey,
  UseTimePeriodListFiltersReturnType,
} from "../typings";
import { CalendarDate } from "@nextui-org/react";
import { useCaloricIntakeTypes, useDefaultNumberRange } from ".";

export const useTimePeriodListFilters =
  (): UseTimePeriodListFiltersReturnType => {
    const [filterMap, setFilterMap] = useState<
      Map<TimePeriodListFilterMapKey, string>
    >(new Map());
    const [filterMinStartDate, setFilterMinStartDate] =
      useState<CalendarDate | null>(null);
    const [filterMaxStartDate, setFilterMaxStartDate] =
      useState<CalendarDate | null>(null);
    const [filterMinEndDate, setFilterMinEndDate] =
      useState<CalendarDate | null>(null);
    const [filterMaxEndDate, setFilterMaxEndDate] =
      useState<CalendarDate | null>(null);
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
      filterMinStartDate,
      setFilterMinStartDate,
      filterMaxStartDate,
      setFilterMaxStartDate,
      filterMinEndDate,
      setFilterMinEndDate,
      filterMaxEndDate,
      setFilterMaxEndDate,
      filterInjury,
      setFilterInjury,
      filterDurationRange,
      setFilterDurationRange,
      filterCaloricIntakeTypes,
      setFilterCaloricIntakeTypes,
      caloricIntakeTypes,
    };
  };
