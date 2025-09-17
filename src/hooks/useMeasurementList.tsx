import { useMemo, useRef, useState } from "react";
import {
  Measurement,
  MeasurementMap,
  MeasurementSortCategory,
  StoreRef,
  UseMeasurementListReturnType,
  UserSettings,
} from "../typings";
import {
  GenerateActiveMeasurementList,
  GetMeasurementList,
  GetMeasurementListWithNumberOfBodyMeasurementsEntries,
  GetPaginationPageFromStore,
  GetSortCategoryFromStore,
  InsertMeasurementIntoDatabase,
  UpdateIsFavorite,
  UpdateItemInList,
} from "../helpers";
import { useMeasurementListFilters, usePaginatedList } from ".";
import { STORE_LIST_KEY_MEASUREMENTS } from "../constants";

type UseMeasurementListProps = {
  store: StoreRef;
  showNumberOfBodyMeasurementsEntries?: boolean;
  ignoreMeasurementsWithNoEntries?: boolean;
};

const STORE_SORT_CATEGORY_KEY = `sort-category-${STORE_LIST_KEY_MEASUREMENTS}`;

export const useMeasurementList = ({
  store,
  showNumberOfBodyMeasurementsEntries,
  ignoreMeasurementsWithNoEntries,
}: UseMeasurementListProps): UseMeasurementListReturnType => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<MeasurementSortCategory>("active");
  const [activeMeasurementSet, setActiveMeasurementSet] = useState<Set<number>>(
    new Set()
  );
  const measurementMap = useRef<MeasurementMap>(new Map());

  const isMeasurementListLoaded = useRef(false);

  const measurementListFilters = useMeasurementListFilters({ store: store });

  const { filterMeasurementTypes, filterMap, loadFilterFromStore } =
    measurementListFilters;

  const filteredMeasurements = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return measurements.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item.measurement_type
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("measurement-types") ||
            filterMeasurementTypes.has(item.measurement_type))
      );
    }
    return measurements;
  }, [measurements, filterQuery, filterMap, filterMeasurementTypes]);

  const {
    validPaginationPage,
    setPaginationPage,
    itemsPerPaginationPage,
    paginatedList: paginatedMeasurements,
    totalPaginationPages,
  } = usePaginatedList(filteredMeasurements);

  const sortMeasurementsByName = (measurements: Measurement[]) => {
    measurements.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setMeasurements(measurements);
  };

  const sortMeasurementsByFavoritesFirst = (
    measurements: Measurement[],
    activeMeasurements?: Set<number>
  ) => {
    const activeSet = activeMeasurements ?? activeMeasurementSet;

    // Sort measurements by Favorite > Active > Name
    measurements.sort((a, b) => {
      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      }

      const aIsActive = +activeSet.has(a.id);
      const bIsActive = +activeSet.has(b.id);

      if (aIsActive !== bIsActive) {
        return bIsActive - aIsActive;
      }

      return a.name.localeCompare(b.name);
    });

    setMeasurements(measurements);
  };

  const sortMeasurementsByActiveFirst = (
    measurements: Measurement[],
    activeMeasurements?: Set<number>
  ) => {
    const activeSet = activeMeasurements ?? activeMeasurementSet;

    // Sort measurements by Active > Favorite > Name
    measurements.sort((a, b) => {
      const aIsActive = +activeSet.has(a.id);
      const bIsActive = +activeSet.has(b.id);

      if (aIsActive !== bIsActive) {
        return bIsActive - aIsActive;
      }

      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      }

      return a.name.localeCompare(b.name);
    });

    setMeasurements(measurements);
  };

  const getMeasurements = async (
    category: MeasurementSortCategory,
    activeMeasurements?: Set<number>,
    shouldSetPaginationPage?: boolean
  ) => {
    const { measurements, newMeasurementMap } =
      showNumberOfBodyMeasurementsEntries
        ? await GetMeasurementListWithNumberOfBodyMeasurementsEntries(
            ignoreMeasurementsWithNoEntries
          )
        : await GetMeasurementList();

    if (shouldSetPaginationPage) {
      const storePaginationPage = await GetPaginationPageFromStore(
        store,
        STORE_LIST_KEY_MEASUREMENTS,
        itemsPerPaginationPage.current,
        measurements.length
      );

      setPaginationPage(storePaginationPage);
    }

    measurementMap.current = newMeasurementMap;

    sortMeasurementsByActiveCategory(
      measurements,
      activeMeasurements,
      category
    );

    isMeasurementListLoaded.current = true;
  };

  const createMeasurement = async (
    newMeasurement: Measurement
  ): Promise<number> => {
    const newMeasurementId = await InsertMeasurementIntoDatabase(
      newMeasurement
    );

    if (newMeasurementId === 0) return 0;

    newMeasurement.id = newMeasurementId;

    const updatedMeasurementMap = new Map(measurementMap.current);

    updatedMeasurementMap.set(newMeasurementId.toString(), newMeasurement);

    sortMeasurementsByActiveCategory([...measurements, newMeasurement]);
    measurementMap.current = updatedMeasurementMap;

    return newMeasurementId;
  };

  const toggleFavorite = async (measurement: Measurement) => {
    const newFavoriteValue = measurement.is_favorite === 1 ? 0 : 1;

    const success = await UpdateIsFavorite(
      measurement.id,
      "measurement",
      newFavoriteValue
    );

    if (!success) return;

    const updatedMeasurement: Measurement = {
      ...measurement,
      is_favorite: newFavoriteValue,
    };

    const updatedMeasurements = UpdateItemInList(
      measurements,
      updatedMeasurement
    );

    sortMeasurementsByActiveCategory(updatedMeasurements);

    const updatedMeasurementMap = new Map<string, Measurement>(
      measurementMap.current
    );

    updatedMeasurementMap.set(measurement.id.toString(), updatedMeasurement);

    measurementMap.current = updatedMeasurementMap;
  };

  const handleSortOptionSelection = async (key: string) => {
    if (store.current === null) return;

    await store.current.set(STORE_SORT_CATEGORY_KEY, { value: key });

    await sortMeasurementsByActiveCategory(
      [...measurements],
      undefined,
      key as MeasurementSortCategory
    );
  };

  const sortMeasurementsByActiveCategory = async (
    measurementList: Measurement[],
    activeMeasurements?: Set<number>,
    newCategory?: MeasurementSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategory(newCategory);
    }

    const activeCategory = newCategory ?? sortCategory;

    switch (activeCategory) {
      case "favorite":
        sortMeasurementsByFavoritesFirst(
          [...measurementList],
          activeMeasurements
        );
        break;
      case "name":
        sortMeasurementsByName([...measurementList]);
        break;
      case "active":
        sortMeasurementsByActiveFirst([...measurementList], activeMeasurements);
        break;
      default:
        // Overwrite invalid categories
        setSortCategory("favorite");
        await store.current.set(STORE_SORT_CATEGORY_KEY, {
          value: "favorite",
        });
        sortMeasurementsByFavoritesFirst(
          [...measurementList],
          activeMeasurements
        );
        break;
    }
  };

  const loadMeasurementList = async (
    userSettings: UserSettings,
    isInModal: boolean
  ) => {
    if (isMeasurementListLoaded.current) return;

    let shouldSetPaginationPage = false;

    if (!isInModal) {
      itemsPerPaginationPage.current =
        userSettings.num_pagination_items_list_desktop;

      shouldSetPaginationPage = true;
    }

    const activeMeasurementList = GenerateActiveMeasurementList(
      userSettings.active_tracking_measurements
    );

    const activeMeasurementSet = new Set(activeMeasurementList);

    setActiveMeasurementSet(activeMeasurementSet);

    await loadFilterFromStore();

    const sortCategory = await GetSortCategoryFromStore(
      store,
      "favorite" as MeasurementSortCategory,
      STORE_LIST_KEY_MEASUREMENTS
    );

    await getMeasurements(
      sortCategory,
      activeMeasurementSet,
      shouldSetPaginationPage
    );
  };

  const loadFilterMeasurementsString = async (measurementsString: string) => {
    const measurementIdSet = new Set<string>();

    const measurementIds = measurementsString.split(",");

    for (const measurementId of measurementIds) {
      if (measurementMap.current.has(measurementId)) {
        measurementIdSet.add(measurementId);
      }
    }

    return measurementIdSet;
  };

  return {
    measurements,
    setMeasurements,
    isMeasurementListLoaded,
    filterQuery,
    setFilterQuery,
    filteredMeasurements,
    toggleFavorite,
    sortCategory,
    handleSortOptionSelection,
    sortMeasurementsByActiveCategory,
    activeMeasurementSet,
    setActiveMeasurementSet,
    measurementMap,
    createMeasurement,
    measurementListFilters,
    loadMeasurementList,
    loadFilterMeasurementsString,
    getMeasurements,
    validPaginationPage,
    setPaginationPage,
    paginatedMeasurements,
    totalPaginationPages,
  };
};
