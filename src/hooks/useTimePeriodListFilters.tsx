import { useMemo, useState } from "react";
import {
  NumberRange,
  TimePeriodListFilterMapKey,
  UseDisclosureReturnType,
  UseTimePeriodListFiltersReturnType,
} from "../typings";
import { CalendarDate } from "@nextui-org/react";
import { useCaloricIntakeTypes, useDefaultNumberRange } from ".";
import {
  ConvertCalendarDateToLocalizedString,
  IsNumberRangeValidAndFiltered,
} from "../helpers";

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
    const [filterMinDuration, setFilterMinDuration] = useState<number | null>(
      null
    );
    const [filterMaxDuration, setFilterMaxDuration] = useState<number | null>(
      null
    );

    const defaultNumberRange = useDefaultNumberRange();

    const [filterDurationRange, setFilterDurationRange] =
      useState<NumberRange>(defaultNumberRange);

    const caloricIntakeTypes = useCaloricIntakeTypes();

    const [filterCaloricIntakeTypes, setFilterCaloricIntakeTypes] = useState<
      Set<string>
    >(new Set(caloricIntakeTypes));

    const handleFilterSaveButton = (
      locale: string,
      activeModal: UseDisclosureReturnType
    ) => {
      const updatedFilterMap = new Map<TimePeriodListFilterMapKey, string>();

      if (filterMinStartDate !== null) {
        const filterMinStartDateString = ConvertCalendarDateToLocalizedString(
          filterMinStartDate,
          locale
        );

        updatedFilterMap.set("min-date-start", filterMinStartDateString);
      }

      if (filterMaxStartDate !== null) {
        const filterMaxStartDateString = ConvertCalendarDateToLocalizedString(
          filterMaxStartDate,
          locale
        );

        updatedFilterMap.set("max-date-start", filterMaxStartDateString);
      }

      if (filterMinEndDate !== null) {
        const filterMinEndDateString = ConvertCalendarDateToLocalizedString(
          filterMinEndDate,
          locale
        );

        updatedFilterMap.set("min-date-end", filterMinEndDateString);
      }

      if (filterMaxEndDate !== null) {
        const filterMaxEndDateString = ConvertCalendarDateToLocalizedString(
          filterMaxEndDate,
          locale
        );

        updatedFilterMap.set("max-date-end", filterMaxEndDateString);
      }

      if (IsNumberRangeValidAndFiltered(filterDurationRange)) {
        const filterDurationRangeString = `${filterDurationRange.start} - ${filterDurationRange.end} Days`;

        updatedFilterMap.set("duration", filterDurationRangeString);
      }

      setFilterMap(updatedFilterMap);

      activeModal.onClose();
    };

    const removeFilter = (key: string) => {
      const updatedFilterMap = new Map(filterMap);

      if (key === "min-date-start" && filterMap.has("min-date-start")) {
        updatedFilterMap.delete("min-date-start");
        setFilterMinStartDate(null);
      }

      if (key === "max-date-start" && filterMap.has("max-date-start")) {
        updatedFilterMap.delete("max-date-start");
        setFilterMaxStartDate(null);
      }

      if (key === "min-date-end" && filterMap.has("min-date-end")) {
        updatedFilterMap.delete("min-date-end");
        setFilterMinEndDate(null);
      }

      if (key === "max-date-end" && filterMap.has("max-date-end")) {
        updatedFilterMap.delete("max-date-end");
        setFilterMaxEndDate(null);
      }

      if (key === "duration" && filterMap.has("duration")) {
        updatedFilterMap.delete("duration");
        setFilterDurationRange(defaultNumberRange);
      }

      setFilterMap(updatedFilterMap);
    };

    const resetFilter = () => {
      setFilterMap(new Map());
      setFilterMinStartDate(null);
      setFilterMaxStartDate(null);
      setFilterMinEndDate(null);
      setFilterMaxEndDate(null);
      setFilterDurationRange(defaultNumberRange);
    };

    const showResetFilterButton = useMemo(() => {
      if (filterMap.size > 0) return true;
      if (filterMinStartDate !== null) return true;
      if (filterMaxStartDate !== null) return true;
      if (filterMinEndDate !== null) return true;
      if (filterMaxEndDate !== null) return true;
      if (filterDurationRange.startInput !== "") return true;
      if (filterDurationRange.endInput !== "") return true;

      return false;
    }, [
      filterMap,
      filterMinStartDate,
      filterMaxStartDate,
      filterMinEndDate,
      filterMaxEndDate,
      filterDurationRange,
    ]);

    const prefixMap = useMemo(() => {
      const prefixMap = new Map<TimePeriodListFilterMapKey, string>();

      prefixMap.set("min-date-start", `Min Start Date: `);
      prefixMap.set("max-date-start", `Max Start Date: `);
      prefixMap.set("min-date-end", `Min End Date: `);
      prefixMap.set("max-date-end", `Max End Date: `);
      prefixMap.set("duration", `Duration: `);

      return prefixMap;
    }, []);

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
      handleFilterSaveButton,
      removeFilter,
      resetFilter,
      showResetFilterButton,
      prefixMap,
      filterMinDuration,
      setFilterMinDuration,
      filterMaxDuration,
      setFilterMaxDuration,
    };
  };
