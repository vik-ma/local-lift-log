import { useMemo, useState } from "react";
import {
  TimePeriodListFilterMapKey,
  UseDisclosureReturnType,
  UseTimePeriodListFiltersReturnType,
} from "../typings";
import { CalendarDate } from "@nextui-org/react";
import { useIsEndDateBeforeStartDate } from ".";
import { ConvertCalendarDateToLocalizedString } from "../helpers";

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
    const [filterHasInjury, setFilterHasInjury] = useState<Set<string>>(
      new Set()
    );
    const [filterMinDuration, setFilterMinDuration] = useState<number | null>(
      null
    );
    const [filterMaxDuration, setFilterMaxDuration] = useState<number | null>(
      null
    );
    const [filterCaloricIntakeTypes, setFilterCaloricIntakeTypes] = useState<
      Set<string>
    >(new Set());

    const isMaxDateBeforeMinDateStart = useIsEndDateBeforeStartDate(
      filterMinStartDate,
      filterMaxStartDate
    );

    const isMaxDateBeforeMinDateEnd = useIsEndDateBeforeStartDate(
      filterMinEndDate,
      filterMaxEndDate
    );

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

      if (filterMinDuration !== null) {
        const filterMinDurationString = `${filterMinDuration} Days`;

        updatedFilterMap.set("min-duration", filterMinDurationString);
      }

      setFilterMap(updatedFilterMap);

      if (filterMaxDuration !== null) {
        const filterMaxDurationString = `${filterMaxDuration} Days`;

        updatedFilterMap.set("max-duration", filterMaxDurationString);
      }

      if (filterCaloricIntakeTypes.size > 0) {
        const filterCaloricIntakeTypesString = Array.from(
          filterCaloricIntakeTypes
        ).join(", ");

        updatedFilterMap.set("caloric-intake", filterCaloricIntakeTypesString);
      }

      if (filterHasInjury.size > 0) {
        const filterHasInjuryString = Array.from(filterHasInjury).join(", ");

        updatedFilterMap.set("injury", filterHasInjuryString);
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

      if (key === "min-duration" && filterMap.has("min-duration")) {
        updatedFilterMap.delete("min-duration");
        setFilterMinDuration(null);
      }

      if (key === "max-duration" && filterMap.has("max-duration")) {
        updatedFilterMap.delete("max-duration");
        setFilterMaxDuration(null);
      }

      if (key === "caloric-intake" && filterMap.has("caloric-intake")) {
        updatedFilterMap.delete("caloric-intake");
        setFilterCaloricIntakeTypes(new Set());
      }

      if (key === "injury" && filterMap.has("injury")) {
        updatedFilterMap.delete("injury");
        setFilterHasInjury(new Set());
      }

      setFilterMap(updatedFilterMap);
    };

    const resetFilter = () => {
      setFilterMap(new Map());
      setFilterMinStartDate(null);
      setFilterMaxStartDate(null);
      setFilterMinEndDate(null);
      setFilterMaxEndDate(null);
      setFilterMinDuration(null);
      setFilterMaxDuration(null);
      setFilterCaloricIntakeTypes(new Set());
      setFilterHasInjury(new Set());
    };

    const showResetFilterButton = useMemo(() => {
      if (filterMap.size > 0) return true;
      if (filterMinStartDate !== null) return true;
      if (filterMaxStartDate !== null) return true;
      if (filterMinEndDate !== null) return true;
      if (filterMaxEndDate !== null) return true;
      if (filterMinDuration !== null) return true;
      if (filterMaxDuration !== null) return true;
      if (filterCaloricIntakeTypes.size > 0) return true;
      if (filterHasInjury.size > 0) return true;

      return false;
    }, [
      filterMap,
      filterMinStartDate,
      filterMaxStartDate,
      filterMinEndDate,
      filterMaxEndDate,
      filterMinDuration,
      filterMaxDuration,
      filterCaloricIntakeTypes,
      filterHasInjury,
    ]);

    const prefixMap = useMemo(() => {
      const prefixMap = new Map<TimePeriodListFilterMapKey, string>();

      prefixMap.set("min-date-start", `Min Start Date: `);
      prefixMap.set("max-date-start", `Max Start Date: `);
      prefixMap.set("min-date-end", `Min End Date: `);
      prefixMap.set("max-date-end", `Max End Date: `);
      prefixMap.set("min-duration", `Min Duration: `);
      prefixMap.set("max-duration", `Max Duration: `);
      prefixMap.set(
        "caloric-intake",
        `Caloric Intake Types (${filterCaloricIntakeTypes.size}): `
      );
      prefixMap.set("injury", `Injury: `);

      return prefixMap;
    }, [filterCaloricIntakeTypes]);

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
      filterHasInjury,
      setFilterHasInjury,
      filterCaloricIntakeTypes,
      setFilterCaloricIntakeTypes,
      handleFilterSaveButton,
      removeFilter,
      resetFilter,
      showResetFilterButton,
      prefixMap,
      filterMinDuration,
      setFilterMinDuration,
      filterMaxDuration,
      setFilterMaxDuration,
      isMaxDateBeforeMinDateStart,
      isMaxDateBeforeMinDateEnd,
    };
  };
