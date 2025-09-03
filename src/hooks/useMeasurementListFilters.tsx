import { useMemo, useState } from "react";
import {
  MeasurementListFilterMapKey,
  StoreRef,
  UseMeasurementListFiltersReturnType,
} from "../typings";
import { MEASUREMENT_TYPES } from "../constants";

type UseMeasurementListFiltersProps = {
  store: StoreRef;
};

export type MeasurementFilterMap = Map<MeasurementListFilterMapKey, string>;

export const useMeasurementListFilters = ({
  store,
}: UseMeasurementListFiltersProps): UseMeasurementListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<MeasurementFilterMap>(new Map());
  const [filterMeasurementTypes, setFilterMeasurementTypes] = useState<
    Set<string>
  >(new Set());

  const handleFilterMeasurementTypes = (key: string) => {
    if (filterMeasurementTypes.has(key)) {
      removeFilter();
      return;
    }

    const updatedFilterMap: MeasurementFilterMap = new Map();

    updatedFilterMap.set("measurement-types", key);

    const updatedFilterMeasurementTypes = new Set<string>([key]);

    setFilterMap(updatedFilterMap);
    setFilterMeasurementTypes(updatedFilterMeasurementTypes);
    saveFilterMapToStore(key);
  };

  const removeFilter = () => {
    setFilterMap(new Map());
    setFilterMeasurementTypes(new Set());
    saveFilterMapToStore(null);
  };

  const saveFilterMapToStore = async (key: string | null) => {
    if (store.current === null) return;

    await store.current.set("filter-measurement-type", {
      value: key,
    });
  };

  const prefixMap = useMemo(() => {
    const prefixMap: MeasurementFilterMap = new Map([
      ["measurement-types", "Measurement Type: "],
    ]);
    return prefixMap;
  }, []);

  const loadFilterFromStore = async () => {
    if (store.current === null) return;

    const val = await store.current.get<{ value: string }>(
      "filter-measurement-type"
    );

    if (val === undefined) return;

    if (MEASUREMENT_TYPES.includes(val.value)) {
      handleFilterMeasurementTypes(val.value);
    }
  };

  return {
    filterMap,
    filterMeasurementTypes,
    handleFilterMeasurementTypes,
    prefixMap,
    removeFilter,
    loadFilterFromStore,
  };
};
