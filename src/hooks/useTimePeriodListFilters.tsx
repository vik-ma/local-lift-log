import { useMemo, useState } from "react";
import {
  TimePeriodListFilterMapKey,
  UseDisclosureReturnType,
  UseFilterMinAndMaxValueInputsArgs,
  UseTimePeriodListFiltersReturnType,
} from "../typings";
import { CalendarDate } from "@heroui/react";
import { useFilterMinAndMaxValueInputs, useIsEndDateBeforeStartDate } from ".";
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
    const [filterDietPhaseTypes, setFilterDietPhaseTypes] = useState<
      Set<string>
    >(new Set());
    const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set());

    const isMaxDateBeforeMinDateStart = useIsEndDateBeforeStartDate(
      filterMinStartDate,
      filterMaxStartDate
    );

    const isMaxDateBeforeMinDateEnd = useIsEndDateBeforeStartDate(
      filterMinEndDate,
      filterMaxEndDate
    );

    const filterMinAndMaxValueInputsArgs: UseFilterMinAndMaxValueInputsArgs = {
      minValue: 1,
      maxValue: undefined,
      isIntegerOnly: true,
    };

    const filterMinAndMaxValueInputs = useFilterMinAndMaxValueInputs(
      filterMinAndMaxValueInputsArgs
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

      if (filterDietPhaseTypes.size > 0) {
        const filterDietPhaseTypesString =
          Array.from(filterDietPhaseTypes).join(", ");

        updatedFilterMap.set("diet-phase", filterDietPhaseTypesString);
      }

      if (filterHasInjury.size > 0) {
        const filterHasInjuryString = Array.from(filterHasInjury).join(", ");

        updatedFilterMap.set("injury", filterHasInjuryString);
      }

      if (filterStatus.size > 0) {
        const filterStatusString = Array.from(filterStatus).join(", ");

        updatedFilterMap.set("status", filterStatusString);
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
        filterMinAndMaxValueInputs.resetMinInput();
      }

      if (key === "max-duration" && filterMap.has("max-duration")) {
        updatedFilterMap.delete("max-duration");
        setFilterMaxDuration(null);
        filterMinAndMaxValueInputs.resetMaxInput();
      }

      if (key === "diet-phase" && filterMap.has("diet-phase")) {
        updatedFilterMap.delete("diet-phase");
        setFilterDietPhaseTypes(new Set());
      }

      if (key === "injury" && filterMap.has("injury")) {
        updatedFilterMap.delete("injury");
        setFilterHasInjury(new Set());
      }

      if (key === "status" && filterMap.has("status")) {
        updatedFilterMap.delete("status");
        setFilterStatus(new Set());
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
      setFilterDietPhaseTypes(new Set());
      setFilterHasInjury(new Set());
      setFilterStatus(new Set());
      filterMinAndMaxValueInputs.resetInputs();
    };

    const showResetFilterButton = useMemo(() => {
      if (filterMap.size > 0) return true;
      if (filterMinStartDate !== null) return true;
      if (filterMaxStartDate !== null) return true;
      if (filterMinEndDate !== null) return true;
      if (filterMaxEndDate !== null) return true;
      if (filterMinDuration !== null) return true;
      if (filterMaxDuration !== null) return true;
      if (filterDietPhaseTypes.size > 0) return true;
      if (filterHasInjury.size > 0) return true;
      if (filterStatus.size > 0) return true;

      return false;
    }, [
      filterMap,
      filterMinStartDate,
      filterMaxStartDate,
      filterMinEndDate,
      filterMaxEndDate,
      filterMinDuration,
      filterMaxDuration,
      filterDietPhaseTypes,
      filterHasInjury,
      filterStatus,
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
        "diet-phase",
        `Diet Phase Types (${filterDietPhaseTypes.size}): `
      );
      prefixMap.set("injury", `Injury: `);
      prefixMap.set("status", `Status: `);

      return prefixMap;
    }, [filterDietPhaseTypes]);

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
      filterDietPhaseTypes,
      setFilterDietPhaseTypes,
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
      filterStatus,
      setFilterStatus,
      filterMinAndMaxValueInputs,
    };
  };
