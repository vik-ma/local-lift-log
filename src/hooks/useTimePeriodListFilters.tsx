import { useMemo, useState } from "react";
import {
  StoreRef,
  TimePeriodFilterMap,
  UseDisclosureReturnType,
  UseFilterMinAndMaxValueInputsProps,
  UseTimePeriodListFiltersReturnType,
} from "../typings";
import { CalendarDate } from "@heroui/react";
import { useFilterMinAndMaxValueInputs, useIsEndDateBeforeStartDate } from ".";
import { ConvertCalendarDateToLocalizedString } from "../helpers";

type UseTimePeriodListFiltersProps = {
  store: StoreRef;
};

export const useTimePeriodListFilters = ({
  store,
}: UseTimePeriodListFiltersProps): UseTimePeriodListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<TimePeriodFilterMap>(new Map());
  const [filterMinStartDate, setFilterMinStartDate] =
    useState<CalendarDate | null>(null);
  const [filterMaxStartDate, setFilterMaxStartDate] =
    useState<CalendarDate | null>(null);
  const [filterMinEndDate, setFilterMinEndDate] = useState<CalendarDate | null>(
    null
  );
  const [filterMaxEndDate, setFilterMaxEndDate] = useState<CalendarDate | null>(
    null
  );
  const [filterHasInjury, setFilterHasInjury] = useState<Set<string>>(
    new Set()
  );
  const [filterMinDuration, setFilterMinDuration] = useState<number | null>(
    null
  );
  const [filterMaxDuration, setFilterMaxDuration] = useState<number | null>(
    null
  );
  const [filterDietPhaseTypes, setFilterDietPhaseTypes] = useState<Set<string>>(
    new Set()
  );
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set());

  const isMaxDateBeforeMinDateStart = useIsEndDateBeforeStartDate({
    startDate: filterMinStartDate,
    endDate: filterMaxStartDate,
  });

  const isMaxDateBeforeMinDateEnd = useIsEndDateBeforeStartDate({
    startDate: filterMinEndDate,
    endDate: filterMaxEndDate,
  });

  const filterMinAndMaxValueInputsProps: UseFilterMinAndMaxValueInputsProps = {
    minValue: 1,
    maxValue: undefined,
    isIntegerOnly: true,
  };

  const filterMinAndMaxValueInputs = useFilterMinAndMaxValueInputs(
    filterMinAndMaxValueInputsProps
  );

  const handleFilterSaveButton = (
    locale: string,
    activeModal: UseDisclosureReturnType,
    storeMinStartDate?: CalendarDate | null,
    storeMaxStartDate?: CalendarDate | null,
    storeMinEndDate?: CalendarDate | null,
    storeMaxEndDate?: CalendarDate | null,
    storeMinDuration?: string,
    storeMaxDuration?: string,
    storeDietPhaseTypes?: Set<string>,
    storeHasInjury?: Set<string>,
    storeStatus?: Set<string>
  ) => {
    const updatedFilterMap: TimePeriodFilterMap = new Map();

    const minStartDate = storeMinStartDate ?? filterMinStartDate;

    if (minStartDate !== null) {
      const filterMinStartDateString = ConvertCalendarDateToLocalizedString(
        minStartDate,
        locale
      );

      updatedFilterMap.set("min-date-start", filterMinStartDateString);
    }

    const maxStartDate = storeMaxStartDate ?? filterMaxStartDate;

    if (maxStartDate !== null) {
      const filterMaxStartDateString = ConvertCalendarDateToLocalizedString(
        maxStartDate,
        locale
      );

      updatedFilterMap.set("max-date-start", filterMaxStartDateString);
    }

    const minEndDate = storeMinEndDate ?? filterMinEndDate;

    if (minEndDate !== null) {
      const filterMinEndDateString = ConvertCalendarDateToLocalizedString(
        minEndDate,
        locale
      );

      updatedFilterMap.set("min-date-end", filterMinEndDateString);
    }

    const maxEndDate = storeMaxEndDate ?? filterMaxEndDate;

    if (maxEndDate !== null) {
      const filterMaxEndDateString = ConvertCalendarDateToLocalizedString(
        maxEndDate,
        locale
      );

      updatedFilterMap.set("max-date-end", filterMaxEndDateString);
    }

    const minDuration = storeMinDuration ?? filterMinDuration;

    if (minDuration !== null) {
      const filterMinDurationString = `${minDuration} Days`;

      updatedFilterMap.set("min-duration", filterMinDurationString);
    }

    const maxDuration = storeMaxDuration ?? filterMaxDuration;

    if (maxDuration !== null) {
      const filterMaxDurationString = `${maxDuration} Days`;

      updatedFilterMap.set("max-duration", filterMaxDurationString);
    }

    const dietPhaseTypes = storeDietPhaseTypes ?? filterDietPhaseTypes;

    if (dietPhaseTypes.size > 0) {
      const filterDietPhaseTypesString = Array.from(dietPhaseTypes).join(", ");

      updatedFilterMap.set("diet-phase", filterDietPhaseTypesString);
    }

    const hasInjury = storeHasInjury ?? filterHasInjury;

    if (hasInjury.size > 0) {
      const filterHasInjuryString = Array.from(hasInjury).join(", ");

      updatedFilterMap.set("injury", filterHasInjuryString);
    }

    const status = storeStatus ?? filterStatus;
    
    if (status.size > 0) {
      const filterStatusString = Array.from(status).join(", ");

      updatedFilterMap.set("status", filterStatusString);
    }

    setFilterMap(updatedFilterMap);

    saveFilterMapToStore(updatedFilterMap);

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

    saveFilterMapToStore(updatedFilterMap);
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

    saveFilterMapToStore(new Map());
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
    const prefixMap: TimePeriodFilterMap = new Map();

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

  const saveFilterMapToStore = async (
    updatedFilterMap: TimePeriodFilterMap
  ) => {
    if (store.current === null) return;

    await store.current.set("filter-map-time-periods", {
      value: JSON.stringify(Array.from(updatedFilterMap.entries())),
    });
  };

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
