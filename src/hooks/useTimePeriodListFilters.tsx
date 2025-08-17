import { useMemo, useRef, useState } from "react";
import {
  TimePeriodFilterValues,
  StoreRef,
  TimePeriodFilterMap,
  TimePeriodListFilterMapKey,
  UseDisclosureReturnType,
  UseTimePeriodListFiltersReturnType,
} from "../typings";
import {
  ConvertCalendarDateToLocalizedString,
  ConvertCalendarDateToYmdString,
  ConvertDateStringToCalendarDate,
  DietPhaseTypes,
  IsEndDateBeforeStartDate,
  IsNumberValidInteger,
} from "../helpers";

type UseTimePeriodListFiltersProps = {
  store: StoreRef;
};

type TimePeriodStoreFilterMap = Map<
  TimePeriodListFilterMapKey,
  string | number
>;

export const useTimePeriodListFilters = ({
  store,
}: UseTimePeriodListFiltersProps): UseTimePeriodListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<TimePeriodFilterMap>(new Map());

  const storeFilters = useRef<TimePeriodStoreFilterMap>(new Map());

  const handleFilterSaveButton = (
    locale: string,
    activeModal?: UseDisclosureReturnType,
    filterStoreValues?: TimePeriodFilterValues
  ) => {
    const updatedFilterMap: TimePeriodFilterMap = new Map();
    const storeFilterMap: TimePeriodStoreFilterMap = new Map();

    const minStartDate =
      filterStoreValues?.filterValueMinStartDate ?? filterMinStartDate;
    if (minStartDate !== null) {
      const filterMinStartDateString = ConvertCalendarDateToLocalizedString(
        minStartDate,
        locale
      );

      updatedFilterMap.set("min-date-start", filterMinStartDateString);

      const filterValueMinStartDateString =
        ConvertCalendarDateToYmdString(minStartDate);

      storeFilterMap.set(
        "min-date-start",
        filterValueMinStartDateString as string
      );
    }

    const maxStartDate =
      filterStoreValues?.filterValueMaxStartDate ?? filterMaxStartDate;
    if (maxStartDate !== null) {
      const filterMaxStartDateString = ConvertCalendarDateToLocalizedString(
        maxStartDate,
        locale
      );

      updatedFilterMap.set("max-date-start", filterMaxStartDateString);

      const filterValueMaxStartDateString =
        ConvertCalendarDateToYmdString(maxStartDate);

      storeFilterMap.set(
        "max-date-start",
        filterValueMaxStartDateString as string
      );
    }

    const minEndDate =
      filterStoreValues?.filterValueMinEndDate ?? filterMinEndDate;
    if (minEndDate !== null) {
      const filterMinEndDateString = ConvertCalendarDateToLocalizedString(
        minEndDate,
        locale
      );

      updatedFilterMap.set("min-date-end", filterMinEndDateString);

      const filterValueMinEndDateString =
        ConvertCalendarDateToYmdString(minEndDate);

      storeFilterMap.set("min-date-end", filterValueMinEndDateString as string);
    }

    const maxEndDate =
      filterStoreValues?.filterValueMaxEndDate ?? filterMaxEndDate;
    if (maxEndDate !== null) {
      const filterMaxEndDateString = ConvertCalendarDateToLocalizedString(
        maxEndDate,
        locale
      );

      updatedFilterMap.set("max-date-end", filterMaxEndDateString);

      const filterValueMaxEndDateString =
        ConvertCalendarDateToYmdString(maxEndDate);

      storeFilterMap.set("max-date-end", filterValueMaxEndDateString as string);
    }

    const minDuration =
      filterStoreValues?.filterValueMinDuration ?? filterMinDuration;
    if (minDuration !== null) {
      const filterMinDurationString = `${minDuration} Days`;

      updatedFilterMap.set("min-duration", filterMinDurationString);

      storeFilterMap.set("min-duration", minDuration);
    }

    const maxDuration =
      filterStoreValues?.filterValueMaxDuration ?? filterMaxDuration;
    if (maxDuration !== null) {
      const filterMaxDurationString = `${maxDuration} Days`;

      updatedFilterMap.set("max-duration", filterMaxDurationString);

      storeFilterMap.set("max-duration", maxDuration);
    }

    const dietPhaseTypes =
      filterStoreValues?.filterValueDietPhaseTypes ?? filterDietPhaseTypes;
    if (dietPhaseTypes.size > 0) {
      const dietPhaseTypesArray = Array.from(dietPhaseTypes);

      const filterDietPhaseTypesString = dietPhaseTypesArray.join(", ");
      updatedFilterMap.set("diet-phase", filterDietPhaseTypesString);

      const filterDietPhaseTypesStoreString = dietPhaseTypesArray.join(",");
      storeFilterMap.set("diet-phase", filterDietPhaseTypesStoreString);
    }

    const hasInjury =
      filterStoreValues?.filterValueHasInjury ?? filterHasInjury;
    if (hasInjury.size > 0) {
      const hasInjuryArray = Array.from(hasInjury);

      const filterHasInjuryString = hasInjuryArray.join(", ");
      updatedFilterMap.set("injury", filterHasInjuryString);

      const filterHasInjuryStoreString = hasInjuryArray.join(",");
      storeFilterMap.set("injury", filterHasInjuryStoreString);
    }

    const status = filterStoreValues?.filterValueStatus ?? filterStatus;
    if (status.size > 0) {
      const statusArray = Array.from(status);

      const filterStatusString = statusArray.join(", ");
      updatedFilterMap.set("status", filterStatusString);

      const filterStatusStoreString = statusArray.join(",");
      storeFilterMap.set("status", filterStatusStoreString);
    }

    setFilterMap(updatedFilterMap);

    saveFilterMapToStore(storeFilterMap);

    if (activeModal !== undefined) activeModal.onClose();
  };

  const removeFilter = (key: string) => {
    const updatedFilterMap = new Map(filterMap);
    const updatedStoreFilterMap = new Map(storeFilters.current);

    switch (key) {
      case "min-date-start": {
        setFilterMinStartDate(null);
        break;
      }
      case "max-date-start": {
        setFilterMaxStartDate(null);
        break;
      }
      case "min-date-end": {
        setFilterMinEndDate(null);
        break;
      }
      case "max-date-end": {
        setFilterMaxEndDate(null);
        break;
      }
      case "min-duration": {
        setFilterMinDuration(null);
        filterMinAndMaxValueInputs.resetMinInput();
        break;
      }
      case "max-duration": {
        setFilterMaxDuration(null);
        filterMinAndMaxValueInputs.resetMaxInput();
        break;
      }
      case "diet-phase": {
        setFilterDietPhaseTypes(new Set());
        break;
      }
      case "injury": {
        setFilterHasInjury(new Set());
        break;
      }
      case "status": {
        setFilterStatus(new Set());
        break;
      }
      case "default": {
        return;
      }
    }

    updatedFilterMap.delete(key as TimePeriodListFilterMapKey);
    updatedStoreFilterMap.delete(key as TimePeriodListFilterMapKey);

    setFilterMap(updatedFilterMap);

    saveFilterMapToStore(updatedStoreFilterMap);
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
    storeFilterMap: TimePeriodStoreFilterMap
  ) => {
    if (store.current === null) return;

    await store.current.set("filter-map-time-periods", {
      value: JSON.stringify(Array.from(storeFilterMap.entries())),
    });

    storeFilters.current = storeFilterMap;
  };

  const loadTimePeriodFilterMapFromStore = async (locale: string) => {
    if (store.current === null) return;

    const val = await store.current.get<{ value: string }>(
      "filter-map-time-periods"
    );

    if (val === undefined) return;

    try {
      const storeFilterList: [TimePeriodListFilterMapKey, string | number][] =
        JSON.parse(val.value);

      if (!Array.isArray(storeFilterList) || storeFilterList.length === 0) {
        handleFilterSaveButton(locale);
        return;
      }

      const filterStoreValues: TimePeriodFilterValues = {};

      const addedKeys = new Set<TimePeriodListFilterMapKey>();

      for (const filter of storeFilterList) {
        const key = filter[0];
        const value = filter[1];

        if (key === undefined || value === undefined || addedKeys.has(key))
          continue;

        addedKeys.add(key);

        switch (key) {
          case "min-date-start": {
            const minStartDate = ConvertDateStringToCalendarDate(
              value as string
            );

            if (minStartDate !== null) {
              setFilterMinStartDate(minStartDate);
              filterStoreValues.filterValueMinStartDate = minStartDate;
            }

            break;
          }
          case "max-date-start": {
            const maxStartDate = ConvertDateStringToCalendarDate(
              value as string
            );

            let isMaxDateBeforeMinDate = false;

            if (filterStoreValues.filterValueMinStartDate) {
              isMaxDateBeforeMinDate = IsEndDateBeforeStartDate(
                filterStoreValues.filterValueMinStartDate,
                maxStartDate
              );
            }

            if (maxStartDate !== null && !isMaxDateBeforeMinDate) {
              setFilterMaxStartDate(maxStartDate);
              filterStoreValues.filterValueMaxStartDate = maxStartDate;
            }

            break;
          }
          case "min-date-end": {
            const minEndDate = ConvertDateStringToCalendarDate(value as string);

            if (minEndDate !== null) {
              setFilterMinEndDate(minEndDate);
              filterStoreValues.filterValueMinEndDate = minEndDate;
            }

            break;
          }
          case "max-date-end": {
            const maxEndDate = ConvertDateStringToCalendarDate(value as string);

            let isMaxDateBeforeMinDate = false;

            if (filterStoreValues.filterValueMinEndDate) {
              isMaxDateBeforeMinDate = IsEndDateBeforeStartDate(
                filterStoreValues.filterValueMinEndDate,
                maxEndDate
              );
            }

            if (maxEndDate !== null && !isMaxDateBeforeMinDate) {
              setFilterMaxEndDate(maxEndDate);
              filterStoreValues.filterValueMaxEndDate = maxEndDate;
            }

            break;
          }
          case "min-duration": {
            const minDuration = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (
              IsNumberValidInteger(minDuration, minValue, doNotAllowMinValue)
            ) {
              setFilterMinDuration(minDuration);
              filterStoreValues.filterValueMinDuration = minDuration;
            }

            break;
          }
          case "max-duration": {
            const maxDuration = value as number;

            const minValue = filterStoreValues.filterValueMinDuration ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (
              IsNumberValidInteger(maxDuration, minValue, doNotAllowMinValue)
            ) {
              setFilterMaxDuration(maxDuration);
              filterStoreValues.filterValueMaxDuration = maxDuration;
            }

            break;
          }
          case "diet-phase": {
            const dietPhaseString = value as string;

            const dietPhaseFilters = dietPhaseString.split(",");

            const dietPhaseSet = new Set<string>();

            for (const dietPhaseFilter of dietPhaseFilters) {
              if (DietPhaseTypes().includes(dietPhaseFilter)) {
                dietPhaseSet.add(dietPhaseFilter);
              }
            }

            setFilterDietPhaseTypes(dietPhaseSet);
            filterStoreValues.filterValueDietPhaseTypes = dietPhaseSet;

            break;
          }
          case "injury": {
            const injuryString = value as string;

            const hasInjuryFilters = injuryString.split(",");

            const hasInjurySet = new Set<string>();

            for (const injuryFilter of hasInjuryFilters) {
              if (
                injuryFilter === "Has Injury" ||
                injuryFilter === "No Injury"
              ) {
                hasInjurySet.add(injuryFilter);
              }
            }

            setFilterHasInjury(hasInjurySet);
            filterStoreValues.filterValueHasInjury = hasInjurySet;

            break;
          }
          case "status": {
            const statusString = value as string;

            const statusFilters = statusString.split(",");

            const statusSet = new Set<string>();

            for (const statusFilter of statusFilters) {
              if (statusFilter === "Ongoing" || statusFilter === "Ended") {
                statusSet.add(statusFilter);
              }
            }

            setFilterStatus(statusSet);
            filterStoreValues.filterValueStatus = statusSet;

            break;
          }
          default:
            break;
        }
      }

      handleFilterSaveButton(locale, undefined, filterStoreValues);
    } catch {
      handleFilterSaveButton(locale);
    }
  };

  return {
    filterMap,
    handleFilterSaveButton,
    removeFilter,
    resetFilter,
    prefixMap,
    loadTimePeriodFilterMapFromStore,
    timePeriodFilterValues,
  };
};
