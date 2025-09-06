import { useMemo, useRef, useState } from "react";
import {
  Distance,
  EquipmentWeight,
  PresetsType,
  EquipmentWeightSortCategory,
  DistanceSortCategory,
  UsePresetsListReturnType,
  PlateCollection,
  StoreRef,
  UserSettings,
  StoreFilterMapKey,
} from "../typings";
import Database from "@tauri-apps/plugin-sql";
import {
  ConvertDistanceToMeter,
  ConvertWeightToKg,
  CreatePlateCollectionList,
  GetSortCategoryFromStore,
  IsDistanceWithinLimit,
  IsWeightWithinLimit,
  UpdateAvailablePlatesInPlateCollection,
  UpdateIsFavorite,
  UpdateItemInList,
} from "../helpers";
import { useListFilters, usePresetsTypeString } from ".";
import { useDisclosure } from "@heroui/react";
import { DEFAULT_PLATE_COLLECTION } from "../constants";

type UsePresetsListProps = {
  store: StoreRef;
};

export const usePresetsList = ({
  store,
}: UsePresetsListProps): UsePresetsListReturnType => {
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>(
    []
  );
  const [distances, setDistances] = useState<Distance[]>([]);
  const [presetsType, setPresetsType] = useState<PresetsType>("equipment");
  const [filterQueryEquipment, setFilterQueryEquipment] = useState<string>("");
  const [filterQueryDistance, setFilterQueryDistance] = useState<string>("");
  const [filterQueryPlateCollection, setFilterQueryPlateCollection] =
    useState<string>("");
  const [sortCategoryEquipment, setSortCategoryEquipment] =
    useState<EquipmentWeightSortCategory>("favorite");
  const [sortCategoryDistance, setSortCategoryDistance] =
    useState<DistanceSortCategory>("favorite");
  const [plateCollections, setPlateCollections] = useState<PlateCollection[]>(
    []
  );
  const [isDefaultPlateCollectionInvalid, setIsDefaultPlateCollectionInvalid] =
    useState<boolean>(false);

  const isEquipmentWeightListLoaded = useRef(false);
  const isDistanceListLoaded = useRef(false);
  const isPlateCollectionListLoaded = useRef(false);

  const equipmentWeightMap = useRef<Map<number, EquipmentWeight>>(new Map());

  const presetsTypeString = usePresetsTypeString({ presetsType });

  const defaultPlateCollection = DEFAULT_PLATE_COLLECTION;

  const [operatingPlateCollection, setOperatingPlateCollection] =
    useState<PlateCollection>(defaultPlateCollection);
  const [otherUnitPlateCollection, setOtherUnitPlateCollection] =
    useState<PlateCollection>(defaultPlateCollection);

  const listFiltersEquipment = useListFilters({
    store: store,
    filterMapSuffix: "equipment-weights",
  });

  const filterPresetsListModal = useDisclosure();

  const filteredEquipmentWeights = useMemo(() => {
    if (
      filterQueryEquipment !== "" ||
      listFiltersEquipment.filterMap.size > 0
    ) {
      return equipmentWeights.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQueryEquipment.toLocaleLowerCase()) ||
            item.weight
              .toString()
              .toLocaleLowerCase()
              .includes(filterQueryEquipment.toLocaleLowerCase())) &&
          (!listFiltersEquipment.filterMap.has("min-weight") ||
            IsWeightWithinLimit(
              item.weight,
              listFiltersEquipment.listFilterValues.filterMinWeight,
              item.weight_unit,
              listFiltersEquipment.listFilterValues.filterWeightRangeUnit,
              false
            )) &&
          (!listFiltersEquipment.filterMap.has("max-weight") ||
            IsWeightWithinLimit(
              item.weight,
              listFiltersEquipment.listFilterValues.filterMaxWeight,
              item.weight_unit,
              listFiltersEquipment.listFilterValues.filterWeightRangeUnit,
              true
            )) &&
          (!listFiltersEquipment.filterMap.has("weight-units") ||
            listFiltersEquipment.listFilterValues.filterWeightUnits.has(
              item.weight_unit
            ))
      );
    }
    return equipmentWeights;
  }, [
    equipmentWeights,
    filterQueryEquipment,
    listFiltersEquipment.filterMap,
    listFiltersEquipment.listFilterValues.filterMinWeight,
    listFiltersEquipment.listFilterValues.filterMaxWeight,
    listFiltersEquipment.listFilterValues.filterWeightRangeUnit,
    listFiltersEquipment.listFilterValues.filterWeightUnits,
  ]);

  const listFiltersDistance = useListFilters({
    store: store,
    filterMapSuffix: "distances",
  });

  const filteredDistances = useMemo(() => {
    if (filterQueryDistance !== "" || listFiltersDistance.filterMap.size > 0) {
      return distances.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQueryDistance.toLocaleLowerCase()) ||
            item.distance
              .toString()
              .toLocaleLowerCase()
              .includes(filterQueryDistance.toLocaleLowerCase())) &&
          (!listFiltersDistance.filterMap.has("min-distance") ||
            IsDistanceWithinLimit(
              item.distance,
              listFiltersDistance.listFilterValues.filterMinDistance,
              item.distance_unit,
              listFiltersDistance.listFilterValues.filterDistanceRangeUnit,
              false
            )) &&
          (!listFiltersDistance.filterMap.has("max-distance") ||
            IsDistanceWithinLimit(
              item.distance,
              listFiltersDistance.listFilterValues.filterMaxDistance,
              item.distance_unit,
              listFiltersDistance.listFilterValues.filterDistanceRangeUnit,
              true
            )) &&
          (!listFiltersDistance.filterMap.has("distance-units") ||
            listFiltersDistance.listFilterValues.filterDistanceUnits.has(
              item.distance_unit
            ))
      );
    }
    return distances;
  }, [
    distances,
    filterQueryDistance,
    listFiltersDistance.filterMap,
    listFiltersDistance.listFilterValues.filterMinDistance,
    listFiltersDistance.listFilterValues.filterMaxDistance,
    listFiltersDistance.listFilterValues.filterDistanceRangeUnit,
    listFiltersDistance.listFilterValues.filterDistanceUnits,
  ]);

  const filteredPlateCollections = useMemo(() => {
    if (filterQueryPlateCollection !== "") {
      return plateCollections.filter((item) =>
        item.name
          .toLocaleLowerCase()
          .includes(filterQueryPlateCollection.toLocaleLowerCase())
      );
    }
    return plateCollections;
  }, [plateCollections, filterQueryPlateCollection]);

  const getEquipmentWeights = async (category: EquipmentWeightSortCategory) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const equipmentWeights = await db.select<EquipmentWeight[]>(
        "SELECT * FROM equipment_weights WHERE weight_unit IN ('kg', 'lbs')"
      );

      equipmentWeightMap.current = equipmentWeights.reduce(
        (map, equipment) => map.set(equipment.id, equipment),
        new Map()
      );

      sortEquipmentWeightsByActiveCategory(equipmentWeights, category);

      isEquipmentWeightListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  };

  const getDistances = async (category: DistanceSortCategory) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Distance[]>(
        "SELECT * FROM distances WHERE distance_unit IN ('km', 'm', 'mi', 'ft', 'yd')"
      );

      sortDistancesByActiveCategory(result, category);
      isDistanceListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  };

  const sortEquipmentWeightsByName = (
    equipmentWeightList: EquipmentWeight[]
  ) => {
    equipmentWeightList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByName = (distanceList: Distance[]) => {
    distanceList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setDistances(distanceList);
  };

  const sortEquipmentWeightsByFavoritesFirst = (
    equipmentWeightList: EquipmentWeight[]
  ) => {
    equipmentWeightList.sort((a, b) => {
      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByFavoritesFirst = (distanceList: Distance[]) => {
    distanceList.sort((a, b) => {
      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setDistances(distanceList);
  };

  const sortEquipmentWeightsByWeight = (
    equipmentWeightList: EquipmentWeight[],
    isAscending: boolean
  ) => {
    equipmentWeightList.sort((a, b) => {
      const weightAInKg = ConvertWeightToKg(a.weight, a.weight_unit);
      const weightBInKg = ConvertWeightToKg(b.weight, b.weight_unit);

      if (weightAInKg !== weightBInKg) {
        if (isAscending) {
          return weightAInKg - weightBInKg;
        } else {
          return weightBInKg - weightAInKg;
        }
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByDistance = (
    distanceList: Distance[],
    isAscending: boolean
  ) => {
    distanceList.sort((a, b) => {
      const distanceAInMeters = ConvertDistanceToMeter(
        a.distance,
        a.distance_unit
      );
      const distanceBInMeters = ConvertDistanceToMeter(
        b.distance,
        b.distance_unit
      );

      if (distanceAInMeters !== distanceBInMeters) {
        if (isAscending) {
          return distanceAInMeters - distanceBInMeters;
        } else {
          return distanceBInMeters - distanceAInMeters;
        }
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setDistances(distanceList);
  };

  const sortEquipmentWeightsByPlateCalcFirst = (
    equipmentWeightList: EquipmentWeight[]
  ) => {
    if (operatingPlateCollection.availablePlatesMap === undefined) return;

    const platesMap = operatingPlateCollection.availablePlatesMap;

    equipmentWeightList.sort((a, b) => {
      const aInMap = platesMap.has(a) ? 1 : 0;
      const bInMap = platesMap.has(b) ? 1 : 0;

      if (platesMap.has(b) !== platesMap.has(a)) {
        return bInMap - aInMap;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const handleSortOptionSelectionEquipment = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-equipment-weights", { value: key });

    await sortEquipmentWeightsByActiveCategory(
      [...equipmentWeights],
      key as EquipmentWeightSortCategory
    );
  };

  const handleSortOptionSelectionDistance = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-distances", { value: key });

    await sortDistancesByActiveCategory(
      [...distances],
      key as DistanceSortCategory
    );
  };

  const toggleFavoriteEquipmentWeight = async (
    equipmentWeight: EquipmentWeight
  ) => {
    const newFavoriteValue = equipmentWeight.is_favorite === 1 ? 0 : 1;

    const success = await UpdateIsFavorite(
      equipmentWeight.id,
      "equipment",
      newFavoriteValue
    );

    if (!success) return;

    const updatedEquipmentWeight: EquipmentWeight = {
      ...equipmentWeight,
      is_favorite: newFavoriteValue,
    };

    const updatedEquipmentWeights = UpdateItemInList(
      equipmentWeights,
      updatedEquipmentWeight
    );

    sortEquipmentWeightsByActiveCategory(updatedEquipmentWeights);
  };

  const toggleFavoriteDistance = async (distance: Distance) => {
    const newFavoriteValue = distance.is_favorite === 1 ? 0 : 1;

    const success = await UpdateIsFavorite(
      distance.id,
      "distance",
      newFavoriteValue
    );

    if (!success) return;

    const updatedDistance: Distance = {
      ...distance,
      is_favorite: newFavoriteValue,
    };

    const updatedDistances = UpdateItemInList(distances, updatedDistance);

    sortDistancesByActiveCategory(updatedDistances);
  };

  const sortEquipmentWeightsByActiveCategory = async (
    equipmentWeightList: EquipmentWeight[],
    newCategory?: EquipmentWeightSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategoryEquipment(newCategory);
    }

    const activeCategory = newCategory ?? sortCategoryEquipment;

    const isAscending = true;

    switch (activeCategory) {
      case "favorite":
        sortEquipmentWeightsByFavoritesFirst([...equipmentWeightList]);
        break;
      case "name":
        sortEquipmentWeightsByName([...equipmentWeightList]);
        break;
      case "weight-asc":
        sortEquipmentWeightsByWeight([...equipmentWeightList], isAscending);
        break;
      case "weight-desc":
        sortEquipmentWeightsByWeight([...equipmentWeightList], !isAscending);
        break;
      case "plate-col":
        sortEquipmentWeightsByPlateCalcFirst([...equipmentWeightList]);
        break;
      default:
        // Overwrite invalid categories
        setSortCategoryEquipment("favorite");
        await store.current.set("sort-category-equipment-weights", {
          value: "favorite",
        });
        sortEquipmentWeightsByFavoritesFirst([...equipmentWeightList]);
        break;
    }
  };

  const sortDistancesByActiveCategory = async (
    distanceList: Distance[],
    newCategory?: DistanceSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategoryDistance(newCategory);
    }

    const activeCategory = newCategory ?? sortCategoryDistance;

    const isAscending = true;

    switch (activeCategory) {
      case "favorite":
        sortDistancesByFavoritesFirst([...distanceList]);
        break;
      case "name":
        sortDistancesByName([...distanceList]);
        break;
      case "distance-asc":
        sortDistancesByDistance([...distanceList], isAscending);
        break;
      case "distance-desc":
        sortDistancesByDistance([...distanceList], !isAscending);
        break;
      default:
        // Overwrite invalid categories
        setSortCategoryDistance("favorite");
        await store.current.set("sort-category-distances", {
          value: "favorite",
        });
        sortDistancesByFavoritesFirst([...distanceList]);
        break;
    }
  };

  const updateAvailablePlatesMapKeys = (equipmentWeight?: EquipmentWeight) => {
    if (
      operatingPlateCollection.availablePlatesMap === undefined ||
      equipmentWeight === undefined
    )
      return;

    const updatedAvailablePlatesMap = new Map(
      operatingPlateCollection.availablePlatesMap
    );

    if (updatedAvailablePlatesMap.has(equipmentWeight)) {
      updatedAvailablePlatesMap.delete(equipmentWeight);
    } else {
      updatedAvailablePlatesMap.set(equipmentWeight, 12);
    }

    const sortedPlates = Array.from(updatedAvailablePlatesMap.keys()).sort(
      (a, b) => a.weight - b.weight
    );

    const sortedAvailablePlatesMap = new Map<EquipmentWeight, number>();

    for (const key of sortedPlates) {
      const value = updatedAvailablePlatesMap.get(key);
      if (value !== undefined) {
        sortedAvailablePlatesMap.set(key, value);
      }
    }

    const updatedPlateCollection = UpdateAvailablePlatesInPlateCollection(
      operatingPlateCollection,
      sortedAvailablePlatesMap
    );

    setOperatingPlateCollection(updatedPlateCollection);
  };

  const updateAvailablePlatesMapValue = (
    equipmentWeight: EquipmentWeight,
    newValue: number
  ) => {
    if (operatingPlateCollection.availablePlatesMap === undefined) return;

    const updatedAvailablePlatesMap = new Map(
      operatingPlateCollection.availablePlatesMap
    );

    updatedAvailablePlatesMap.set(equipmentWeight, newValue);

    const updatedPlateCollection = UpdateAvailablePlatesInPlateCollection(
      operatingPlateCollection,
      updatedAvailablePlatesMap
    );

    setOperatingPlateCollection(updatedPlateCollection);
  };

  const loadEquipmentWeightList = async (userSettings: UserSettings) => {
    if (isEquipmentWeightListLoaded.current) return;

    const validFilterKeys = new Set<StoreFilterMapKey>([
      "min-weight",
      "max-weight",
      "weight-range-unit",
      "weight-units",
    ]);

    await listFiltersEquipment.loadFilterMapFromStore(
      userSettings,
      validFilterKeys
    );

    const sortCategory = await GetSortCategoryFromStore(
      store,
      "favorite" as EquipmentWeightSortCategory,
      "equipment-weights"
    );

    await getEquipmentWeights(sortCategory);
  };

  const loadDistanceList = async (userSettings: UserSettings) => {
    if (isDistanceListLoaded.current) return;

    const validFilterKeys = new Set<StoreFilterMapKey>([
      "min-distance",
      "max-distance",
      "distance-range-unit",
      "distance-units",
    ]);

    await listFiltersDistance.loadFilterMapFromStore(
      userSettings,
      validFilterKeys
    );

    const sortCategory = await GetSortCategoryFromStore(
      store,
      "favorite" as DistanceSortCategory,
      "distances"
    );

    await getDistances(sortCategory);
  };

  const loadPlateCollectionList = async (userSettings: UserSettings) => {
    if (isPlateCollectionListLoaded.current) return;

    await loadEquipmentWeightList(userSettings);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const plateCollections = await db.select<PlateCollection[]>(
        "SELECT * FROM plate_collections"
      );

      const { plateCollectionList, defaultPlateCollection } =
        CreatePlateCollectionList(
          plateCollections,
          equipmentWeightMap.current,
          userSettings.default_plate_collection_id
        );

      if (defaultPlateCollection !== undefined) {
        setOperatingPlateCollection(defaultPlateCollection);
      } else {
        setIsDefaultPlateCollectionInvalid(true);
      }

      setPlateCollections(plateCollectionList);
      isPlateCollectionListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    equipmentWeights,
    setEquipmentWeights,
    distances,
    setDistances,
    getEquipmentWeights,
    getDistances,
    presetsType,
    setPresetsType,
    filterQueryEquipment,
    setFilterQueryEquipment,
    filteredEquipmentWeights,
    filterQueryDistance,
    setFilterQueryDistance,
    filteredDistances,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
    sortCategoryEquipment,
    sortCategoryDistance,
    handleSortOptionSelectionEquipment,
    handleSortOptionSelectionDistance,
    isEquipmentWeightListLoaded,
    isDistanceListLoaded,
    sortEquipmentWeightsByActiveCategory,
    sortDistancesByActiveCategory,
    plateCollections,
    setPlateCollections,
    operatingPlateCollection,
    setOperatingPlateCollection,
    filteredPlateCollections,
    filterQueryPlateCollection,
    setFilterQueryPlateCollection,
    updateAvailablePlatesMapKeys,
    otherUnitPlateCollection,
    setOtherUnitPlateCollection,
    defaultPlateCollection,
    updateAvailablePlatesMapValue,
    isDefaultPlateCollectionInvalid,
    setIsDefaultPlateCollectionInvalid,
    listFiltersEquipment,
    listFiltersDistance,
    filterPresetsListModal,
    presetsTypeString,
    loadEquipmentWeightList,
    loadDistanceList,
    loadPlateCollectionList,
    equipmentWeightMap,
    isPlateCollectionListLoaded,
  };
};
