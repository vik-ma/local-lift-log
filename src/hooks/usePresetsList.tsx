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
} from "../typings";
import Database from "@tauri-apps/plugin-sql";
import {
  ConvertDistanceToMeter,
  ConvertWeightToKg,
  CreatePlateCollectionList,
  IsDistanceWithinLimit,
  IsWeightWithinLimit,
  UpdateAvailablePlatesInPlateCollection,
  UpdateIsFavorite,
  UpdateItemInList,
} from "../helpers";
import { useListFilters, usePresetsTypeString } from ".";
import { useDisclosure } from "@heroui/react";

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

  const defaultPlateCollection: PlateCollection = useMemo(() => {
    return {
      id: 0,
      name: "",
      handle_id: 0,
      available_plates_string: "",
      num_handles: 1,
      weight_unit: "kg",
      availablePlatesMap: new Map(),
    };
  }, []);

  const [operatingPlateCollection, setOperatingPlateCollection] =
    useState<PlateCollection>(defaultPlateCollection);
  const [otherUnitPlateCollection, setOtherUnitPlateCollection] =
    useState<PlateCollection>(defaultPlateCollection);

  const listFilters = useListFilters();

  const {
    filterMap,
    filterMinWeight,
    filterMaxWeight,
    filterWeightRangeUnit,
    filterWeightUnits,
    filterMinDistance,
    filterMaxDistance,
    filterDistanceRangeUnit,
    filterDistanceUnits,
  } = listFilters;

  const filterPresetsListModal = useDisclosure();

  const filteredEquipmentWeights = useMemo(() => {
    if (filterQueryEquipment !== "" || filterMap.size > 0) {
      return equipmentWeights.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQueryEquipment.toLocaleLowerCase()) ||
            item.weight
              .toString()
              .toLocaleLowerCase()
              .includes(filterQueryEquipment.toLocaleLowerCase())) &&
          (!filterMap.has("min-weight") ||
            IsWeightWithinLimit(
              item.weight,
              filterMinWeight,
              item.weight_unit,
              filterWeightRangeUnit,
              false
            )) &&
          (!filterMap.has("max-weight") ||
            IsWeightWithinLimit(
              item.weight,
              filterMaxWeight,
              item.weight_unit,
              filterWeightRangeUnit,
              true
            )) &&
          (!filterMap.has("weight-units") ||
            filterWeightUnits.has(item.weight_unit))
      );
    }
    return equipmentWeights;
  }, [
    equipmentWeights,
    filterQueryEquipment,
    filterMap,
    filterMinWeight,
    filterMaxWeight,
    filterWeightRangeUnit,
    filterWeightUnits,
  ]);

  const filteredDistances = useMemo(() => {
    if (filterQueryDistance !== "" || filterMap.size > 0) {
      return distances.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQueryDistance.toLocaleLowerCase()) ||
            item.distance
              .toString()
              .toLocaleLowerCase()
              .includes(filterQueryDistance.toLocaleLowerCase())) &&
          (!filterMap.has("min-distance") ||
            IsDistanceWithinLimit(
              item.distance,
              filterMinDistance,
              item.distance_unit,
              filterDistanceRangeUnit,
              false
            )) &&
          (!filterMap.has("max-distance") ||
            IsDistanceWithinLimit(
              item.distance,
              filterMaxDistance,
              item.distance_unit,
              filterDistanceRangeUnit,
              true
            )) &&
          (!filterMap.has("distance-units") ||
            filterDistanceUnits.has(item.distance_unit))
      );
    }
    return distances;
  }, [
    distances,
    filterQueryDistance,
    filterMap,
    filterMinDistance,
    filterMaxDistance,
    filterDistanceRangeUnit,
    filterDistanceUnits,
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

  const getEquipmentWeights = async (
    category: EquipmentWeightSortCategory,
    defaultPlateCollectionId?: number
  ) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const equipmentWeights = await db.select<EquipmentWeight[]>(
        "SELECT * FROM equipment_weights WHERE weight_unit IN ('kg', 'lbs')"
      );

      const plateCollections = await db.select<PlateCollection[]>(
        "SELECT * FROM plate_collections"
      );

      sortEquipmentWeightsByActiveCategory(equipmentWeights, category);

      const plateCollectionList = CreatePlateCollectionList(
        plateCollections,
        equipmentWeights
      );

      setPlateCollections(plateCollectionList);
      isEquipmentWeightListLoaded.current = true;

      if (defaultPlateCollectionId !== undefined) {
        const defaultPlateCollection = plateCollectionList.find(
          (plateCollection) => plateCollection.id === defaultPlateCollectionId
        );

        if (defaultPlateCollection !== undefined) {
          setOperatingPlateCollection(defaultPlateCollection);
        } else {
          setIsDefaultPlateCollectionInvalid(true);
        }
      }
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

  const presetsTypeString = usePresetsTypeString(presetsType);

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
    listFilters,
    filterPresetsListModal,
    presetsTypeString,
  };
};
