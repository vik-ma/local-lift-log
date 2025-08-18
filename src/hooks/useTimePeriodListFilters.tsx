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
  DefaultTimePeriodFilterValues,
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

  const defaultTimePeriodFilterValues = useMemo(
    () => DefaultTimePeriodFilterValues(),
    []
  );

  const [timePeriodFilterValues, setTimePeriodFilterValues] =
    useState<TimePeriodFilterValues>(defaultTimePeriodFilterValues);

  const storeFilters = useRef<TimePeriodStoreFilterMap>(new Map());

  const handleFilterSaveButton = (
    locale: string,
    filterValues: TimePeriodFilterValues,
    activeModal?: UseDisclosureReturnType
  ) => {
    const updatedFilterMap: TimePeriodFilterMap = new Map();
    const storeFilterMap: TimePeriodStoreFilterMap = new Map();

    const {
      filterMinStartDate,
      filterMaxStartDate,
      filterMinEndDate,
      filterMaxEndDate,
      filterMinDuration,
      filterMaxDuration,
      filterDietPhaseTypes,
      filterHasInjury,
      filterStatus,
    } = filterValues;

    if (filterMinStartDate !== null) {
      const filterMinStartDateString = ConvertCalendarDateToLocalizedString(
        filterMinStartDate,
        locale
      );

      updatedFilterMap.set("min-date-start", filterMinStartDateString);

      const filterValueMinStartDateString =
        ConvertCalendarDateToYmdString(filterMinStartDate);

      storeFilterMap.set(
        "min-date-start",
        filterValueMinStartDateString as string
      );
    }

    if (filterMaxStartDate !== null) {
      const filterMaxStartDateString = ConvertCalendarDateToLocalizedString(
        filterMaxStartDate,
        locale
      );

      updatedFilterMap.set("max-date-start", filterMaxStartDateString);

      const filterValueMaxStartDateString =
        ConvertCalendarDateToYmdString(filterMaxStartDate);

      storeFilterMap.set(
        "max-date-start",
        filterValueMaxStartDateString as string
      );
    }

    if (filterMinEndDate !== null) {
      const filterMinEndDateString = ConvertCalendarDateToLocalizedString(
        filterMinEndDate,
        locale
      );

      updatedFilterMap.set("min-date-end", filterMinEndDateString);

      const filterValueMinEndDateString =
        ConvertCalendarDateToYmdString(filterMinEndDate);

      storeFilterMap.set("min-date-end", filterValueMinEndDateString as string);
    }

    if (filterMaxEndDate !== null) {
      const filterMaxEndDateString = ConvertCalendarDateToLocalizedString(
        filterMaxEndDate,
        locale
      );

      updatedFilterMap.set("max-date-end", filterMaxEndDateString);

      const filterValueMaxEndDateString =
        ConvertCalendarDateToYmdString(filterMaxEndDate);

      storeFilterMap.set("max-date-end", filterValueMaxEndDateString as string);
    }

    if (filterMinDuration !== null) {
      const filterMinDurationString = `${filterMinDuration} Days`;

      updatedFilterMap.set("min-duration", filterMinDurationString);

      storeFilterMap.set("min-duration", filterMinDuration);
    }

    if (filterMaxDuration !== null) {
      const filterMaxDurationString = `${filterMaxDuration} Days`;

      updatedFilterMap.set("max-duration", filterMaxDurationString);

      storeFilterMap.set("max-duration", filterMaxDuration);
    }

    if (filterDietPhaseTypes.size > 0) {
      const dietPhaseTypesArray = Array.from(filterDietPhaseTypes);

      const filterDietPhaseTypesString = dietPhaseTypesArray.join(", ");
      updatedFilterMap.set("diet-phase", filterDietPhaseTypesString);

      const filterDietPhaseTypesStoreString = dietPhaseTypesArray.join(",");
      storeFilterMap.set("diet-phase", filterDietPhaseTypesStoreString);
    }

    if (filterHasInjury.size > 0) {
      const hasInjuryArray = Array.from(filterHasInjury);

      const filterHasInjuryString = hasInjuryArray.join(", ");
      updatedFilterMap.set("injury", filterHasInjuryString);

      const filterHasInjuryStoreString = hasInjuryArray.join(",");
      storeFilterMap.set("injury", filterHasInjuryStoreString);
    }

    if (filterStatus.size > 0) {
      const statusArray = Array.from(filterStatus);

      const filterStatusString = statusArray.join(", ");
      updatedFilterMap.set("status", filterStatusString);

      const filterStatusStoreString = statusArray.join(",");
      storeFilterMap.set("status", filterStatusStoreString);
    }

    setFilterMap(updatedFilterMap);
    setTimePeriodFilterValues(filterValues);
    saveFilterMapToStore(storeFilterMap);

    if (activeModal !== undefined) activeModal.onClose();
  };

  const removeFilter = (key: string) => {
    const updatedFilterMap = new Map(filterMap);
    const updatedStoreFilterMap = new Map(storeFilters.current);
    const updatedTimePeriodFilterValues = { ...timePeriodFilterValues };

    switch (key) {
      case "min-date-start": {
        updatedTimePeriodFilterValues.filterMinStartDate = null;
        break;
      }
      case "max-date-start": {
        updatedTimePeriodFilterValues.filterMaxStartDate = null;
        break;
      }
      case "min-date-end": {
        updatedTimePeriodFilterValues.filterMinEndDate = null;
        break;
      }
      case "max-date-end": {
        updatedTimePeriodFilterValues.filterMaxEndDate = null;
        break;
      }
      case "min-duration": {
        updatedTimePeriodFilterValues.filterMinDuration = null;
        break;
      }
      case "max-duration": {
        updatedTimePeriodFilterValues.filterMaxDuration = null;
        break;
      }
      case "diet-phase": {
        updatedTimePeriodFilterValues.filterDietPhaseTypes = new Set();
        break;
      }
      case "injury": {
        updatedTimePeriodFilterValues.filterHasInjury = new Set();
        break;
      }
      case "status": {
        updatedTimePeriodFilterValues.filterStatus = new Set();
        break;
      }
      case "default": {
        return;
      }
    }

    updatedFilterMap.delete(key as TimePeriodListFilterMapKey);
    updatedStoreFilterMap.delete(key as TimePeriodListFilterMapKey);

    setFilterMap(updatedFilterMap);
    setTimePeriodFilterValues(updatedTimePeriodFilterValues);
    saveFilterMapToStore(updatedStoreFilterMap);
  };

  const resetFilter = () => {
    setFilterMap(new Map());
    setTimePeriodFilterValues({ ...defaultTimePeriodFilterValues });
    saveFilterMapToStore(new Map());
  };

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
      `Diet Phase Types (${timePeriodFilterValues.filterDietPhaseTypes.size}): `
    );
    prefixMap.set("injury", `Injury: `);
    prefixMap.set("status", `Status: `);

    return prefixMap;
  }, [timePeriodFilterValues.filterDietPhaseTypes]);

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
