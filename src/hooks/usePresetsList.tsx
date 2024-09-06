import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Distance,
  EquipmentWeight,
  PresetsType,
  EquipmentWeightSortCategory,
  DistanceSortCategory,
  UsePresetsListReturnType,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import { useDisclosure } from "@nextui-org/react";
import { UpdateIsFavorite, UpdateItemInList } from "../helpers";

export const usePresetsList = (
  getEquipmentWeightsOnLoad: boolean,
  getDistancesOnLoad: boolean,
  defaultPresetType?: PresetsType
): UsePresetsListReturnType => {
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>(
    []
  );
  const [distances, setDistances] = useState<Distance[]>([]);
  const [presetsType, setPresetsType] = useState<PresetsType>(
    defaultPresetType ?? "equipment"
  );
  const [favoritesCheckboxValueEquipment, setFavoritesCheckboxValueEquipment] =
    useState<boolean>(true);
  const [favoritesCheckboxValueDistance, setFavoritesCheckboxValueDistance] =
    useState<boolean>(true);
  const [filterQueryEquipment, setFilterQueryEquipment] = useState<string>("");
  const [filterQueryDistance, setFilterQueryDistance] = useState<string>("");
  const [sortCategoryEquipment, setSortCategoryEquipment] =
    useState<EquipmentWeightSortCategory>("name");
  const [sortCategoryDistance, setSortCategoryDistance] =
    useState<DistanceSortCategory>("name");

  const equipmentWeightsAreLoaded = useRef(false);
  const distancesAreLoaded = useRef(false);

  const calculationModal = useDisclosure();

  const filteredEquipmentWeights = useMemo(() => {
    if (filterQueryEquipment !== "") {
      return equipmentWeights.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQueryEquipment.toLocaleLowerCase()) ||
          item.weight
            .toString()
            .toLocaleLowerCase()
            .includes(filterQueryEquipment.toLocaleLowerCase())
      );
    }
    return equipmentWeights;
  }, [equipmentWeights, filterQueryEquipment]);

  const filteredDistances = useMemo(() => {
    if (filterQueryDistance !== "") {
      return distances.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQueryDistance.toLocaleLowerCase()) ||
          item.distance
            .toString()
            .toLocaleLowerCase()
            .includes(filterQueryDistance.toLocaleLowerCase())
      );
    }
    return distances;
  }, [distances, filterQueryDistance]);

  const getEquipmentWeights = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<EquipmentWeight[]>(
        "SELECT * FROM equipment_weights"
      );

      sortEquipmentWeightsByName(result, true);
      equipmentWeightsAreLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getDistances = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Distance[]>("SELECT * FROM distances");

      sortDistancesByName(result, true);
      distancesAreLoaded.current = true;
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

  const handleOpenCalculationModal = useCallback(
    (presetsType: PresetsType) => {
      if (
        presetsType === "equipment" &&
        equipmentWeightsAreLoaded.current === false
      ) {
        getEquipmentWeights();
      }

      if (presetsType === "distance" && distancesAreLoaded.current === false) {
        getDistances();
      }

      calculationModal.onOpen();
    },
    [calculationModal, getEquipmentWeights, getDistances]
  );

  const sortEquipmentWeightsByName = (
    equipmentWeightList: EquipmentWeight[],
    listFavoritesFirst: boolean
  ) => {
    equipmentWeightList.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByName = (
    distanceList: Distance[],
    listFavoritesFirst: boolean
  ) => {
    distanceList.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setDistances(distanceList);
  };

  const sortEquipmentWeightsByWeight = (
    equipmentWeightList: EquipmentWeight[],
    listFavoritesFirst: boolean,
    isAscending: boolean
  ) => {
    const sortedArray = equipmentWeightList.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        if (isAscending) {
          return a.weight - b.weight;
        } else {
          return b.weight - a.weight;
        }
      }
    });

    setEquipmentWeights(sortedArray);
  };

  const sortDistancesByDistance = (
    distanceList: Distance[],
    listFavoritesFirst: boolean,
    isAscending: boolean
  ) => {
    const sortedArray = distanceList.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        if (isAscending) {
          return a.distance - b.distance;
        } else {
          return b.distance - a.distance;
        }
      }
    });

    setDistances(sortedArray);
  };

  const handleSortOptionSelectionEquipment = (key: string) => {
    if (key === "name") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByName(
        [...equipmentWeights],
        favoritesCheckboxValueEquipment
      );
    } else if (key === "weight-desc") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByWeight(
        [...equipmentWeights],
        favoritesCheckboxValueEquipment,
        false
      );
    } else if (key === "weight-asc") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByWeight(
        [...equipmentWeights],
        favoritesCheckboxValueEquipment,
        true
      );
    }
  };

  const handleSortOptionSelectionDistance = (key: string) => {
    if (key === "name") {
      setSortCategoryDistance(key);
      sortDistancesByName([...distances], favoritesCheckboxValueDistance);
    } else if (key === "distance-desc") {
      setSortCategoryDistance(key);
      sortDistancesByDistance(
        [...distances],
        favoritesCheckboxValueDistance,
        false
      );
    } else if (key === "distance-asc") {
      setSortCategoryDistance(key);
      sortDistancesByDistance(
        [...distances],
        favoritesCheckboxValueDistance,
        true
      );
    }
  };

  const handleListFavoritesFirstChange = (
    presetsType: PresetsType,
    value: boolean
  ) => {
    if (presetsType === "equipment") {
      sortEquipmentWeightsByName([...equipmentWeights], value);
      setFavoritesCheckboxValueEquipment(value);
    } else if (presetsType === "distance") {
      sortDistancesByName([...distances], value);
      setFavoritesCheckboxValueDistance(value);
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

    sortEquipmentWeightsByName(
      updatedEquipmentWeights,
      favoritesCheckboxValueEquipment
    );
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

    sortDistancesByName(updatedDistances, favoritesCheckboxValueDistance);
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
    calculationModal,
    handleOpenCalculationModal,
    filterQueryEquipment,
    setFilterQueryEquipment,
    filteredEquipmentWeights,
    filterQueryDistance,
    setFilterQueryDistance,
    filteredDistances,
    handleListFavoritesFirstChange,
    favoritesCheckboxValueEquipment,
    favoritesCheckboxValueDistance,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
    sortCategoryEquipment,
    sortCategoryDistance,
    handleSortOptionSelectionEquipment,
    handleSortOptionSelectionDistance,
  };
};
