import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Distance,
  EquipmentWeight,
  PresetsType,
  EquipmentWeightSortCategory,
  DistanceSortCategory,
  UsePresetsListReturnType,
  PlateCollection,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  ConvertDistanceToMeter,
  ConvertWeightToKg,
  CreatePlateCollectionList,
  IsDistanceWithinNumberRange,
  IsWeightWithinNumberRange,
  UpdateAvailablePlatesInPlateCollection,
  UpdateIsFavorite,
  UpdateItemInList,
} from "../helpers";
import { useListFilters } from "./useListFilters";
import { useDisclosure } from "@nextui-org/react";
import { usePresetsTypeString } from "./usePresetsTypeString";

export const usePresetsList = (
  getEquipmentWeightsOnLoad: boolean,
  getDistancesOnLoad: boolean
): UsePresetsListReturnType => {
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
    filterWeightRange,
    filterWeightRangeUnit,
    filterWeightUnits,
    filterDistanceRange,
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
          (!filterMap.has("weight") ||
            IsWeightWithinNumberRange(
              filterWeightRange,
              item.weight,
              item.weight_unit,
              filterWeightRangeUnit
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
    filterWeightRange,
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
          (!filterMap.has("distance") ||
            IsDistanceWithinNumberRange(
              filterDistanceRange,
              item.distance,
              item.distance_unit,
              filterDistanceRangeUnit
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
    filterDistanceRange,
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

  const getEquipmentWeights = useCallback(
    async (defaultPlateCollectionId?: number) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const equipmentWeights = await db.select<EquipmentWeight[]>(
          "SELECT * FROM equipment_weights"
        );

        const plateCollections = await db.select<PlateCollection[]>(
          "SELECT * FROM plate_collections"
        );

        sortEquipmentWeightsByFavoritesFirst(equipmentWeights);

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
    },
    []
  );

  const getDistances = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Distance[]>("SELECT * FROM distances");

      sortDistancesByFavoritesFirst(result);
      isDistanceListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (getEquipmentWeightsOnLoad) {
      getEquipmentWeights();
    }

    if (getDistancesOnLoad) {
      getDistances();
    }
  }, [
    getEquipmentWeightsOnLoad,
    getDistancesOnLoad,
    getEquipmentWeights,
    getDistances,
  ]);

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

  const handleSortOptionSelectionEquipment = (key: string) => {
    if (key === "favorite") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByFavoritesFirst([...equipmentWeights]);
    } else if (key === "weight-desc") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByWeight([...equipmentWeights], false);
    } else if (key === "weight-asc") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByWeight([...equipmentWeights], true);
    } else if (key === "name") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByName([...equipmentWeights]);
    } else if (key === "plate-col") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByPlateCalcFirst([...equipmentWeights]);
    }
  };

  const handleSortOptionSelectionDistance = (key: string) => {
    if (key === "favorite") {
      setSortCategoryDistance(key);
      sortDistancesByFavoritesFirst([...distances]);
    } else if (key === "distance-desc") {
      setSortCategoryDistance(key);
      sortDistancesByDistance([...distances], false);
    } else if (key === "distance-asc") {
      setSortCategoryDistance(key);
      sortDistancesByDistance([...distances], true);
    } else if (key === "name") {
      setSortCategoryDistance(key);
      sortDistancesByName([...distances]);
    }
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

    sortEquipmentWeightByActiveCategory(updatedEquipmentWeights);
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

  const sortEquipmentWeightByActiveCategory = (
    equipmentWeightList: EquipmentWeight[]
  ) => {
    switch (sortCategoryEquipment) {
      case "favorite":
        sortEquipmentWeightsByFavoritesFirst(equipmentWeightList);
        break;
      case "name":
        sortEquipmentWeightsByName(equipmentWeightList);
        break;
      case "weight-asc":
        sortEquipmentWeightsByWeight(equipmentWeightList, true);
        break;
      case "weight-desc":
        sortEquipmentWeightsByWeight(equipmentWeightList, false);
        break;
      case "plate-col":
        sortEquipmentWeightsByPlateCalcFirst(equipmentWeightList);
        break;
      default:
        break;
    }
  };

  const sortDistancesByActiveCategory = (distanceList: Distance[]) => {
    switch (sortCategoryDistance) {
      case "favorite":
        sortDistancesByFavoritesFirst(distanceList);
        break;
      case "name":
        sortDistancesByName(distanceList);
        break;
      case "distance-asc":
        sortDistancesByDistance(distanceList, true);
        break;
      case "distance-desc":
        sortDistancesByDistance(distanceList, false);
        break;
      default:
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

  const handleOpenFilterButton = async () => {
    if (presetsType === "equipment" && !isEquipmentWeightListLoaded.current) {
      await getEquipmentWeights();
    }

    if (presetsType === "distance" && !isDistanceListLoaded.current) {
      await getDistances();
    }

    filterPresetsListModal.onOpen();
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
    sortEquipmentWeightByActiveCategory,
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
    handleOpenFilterButton,
  };
};
